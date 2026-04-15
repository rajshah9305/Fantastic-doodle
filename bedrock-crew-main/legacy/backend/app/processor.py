import asyncio
import logging
import time
from typing import Any, Dict

from groq import AsyncGroq

from app.config import settings
from app.intent_detector import IntentDetector
from app.models import IntentType, ProcessResponse
from app.models_config import get_model_config, is_valid_model
from app.retry_handler import RetryHandler

logger = logging.getLogger(__name__)

# crewAI and its heavy dependencies are imported lazily to keep the serverless
# function bootable even when the full dependency tree isn't available (e.g. Vercel).
_crewai_available = None


def _check_crewai():
    global _crewai_available
    if _crewai_available is None:
        try:
            from crewai import Agent, Crew, Task  # noqa: F401
            from langchain_openai import ChatOpenAI  # noqa: F401
            _crewai_available = True
        except ImportError as e:
            _crewai_available = False
            logger.warning(f"crewAI dependencies not available ({e}) — falling back to direct Groq API calls")
    return _crewai_available


class NLPProcessor:
    """Processes NLP requests using crewAI and Groq"""

    def __init__(self, api_key: str, model: str = None):
        self.api_key = api_key
        self.groq_client = AsyncGroq(api_key=api_key)

        # Validate and set model
        if model and is_valid_model(model):
            self.model = model
        else:
            self.model = settings.default_groq_model

        self.model_config = get_model_config(self.model)

    async def process(self, text: str, options: Dict[str, Any]) -> ProcessResponse:
        """Process text with automatic intent detection and routing"""
        start_time = time.time()

        # Detect intent
        intent, confidence = IntentDetector.detect(text)
        logger.info(f"Intent detected: {intent.value} (confidence: {confidence:.2f})")

        # Define processing logic for retry
        async def run_processing():
            # Route to crewAI agent when confidence is high and crewAI is available
            if confidence > 0.7 and intent != IntentType.CUSTOM and _check_crewai():
                logger.info(f"Routing to crewAI agent for {intent.value}")
                return await self._process_with_crew(text, intent, options)
            else:
                logger.info("Using direct Groq API call")
                return await self._process_with_groq(text, intent, options)

        # Execute with retry logic
        result, tokens = await RetryHandler.retry_with_backoff(
            run_processing,
            max_retries=2,
            initial_delay=1.0,
            exceptions=(Exception,)
        )

        processing_time = time.time() - start_time
        logger.info(f"Processing completed in {processing_time:.2f}s")

        return ProcessResponse(
            intent=intent.value,
            result=result,
            model=self.model,
            tokens_used=tokens,
            processing_time=round(processing_time, 2),
            metadata={"confidence": confidence, "model_name": self.model_config["name"]}
        )

    async def _process_with_crew(
        self, text: str, intent: IntentType, options: Dict[str, Any]
    ) -> tuple[str, int]:
        """Process using crewAI agents"""
        try:
            from crewai import Agent, Crew, Task
            from langchain_openai import ChatOpenAI

            logger.info(f"Creating specialized agent for {intent.value}")

            # Setup tools
            tools = []
            if options.get('enable_search'):
                from langchain_community.tools import DuckDuckGoSearchRun
                logger.info("Enabling search tool")
                tools.append(DuckDuckGoSearchRun())

            # Create specialized agent based on intent
            agent = Agent(
                role=self._get_agent_role(intent),
                goal=self._get_agent_goal(intent),
                backstory=self._get_agent_backstory(intent),
                verbose=False,
                allow_delegation=False,
                llm=self._create_llm_config(),
                tools=tools,
                allow_code_execution=options.get('enable_code', False)
            )

            logger.info("Creating task for agent")
            task = Task(
                description=text,
                agent=agent,
                expected_output=self._get_expected_output(intent)
            )

            logger.info(f"Executing crew with {self.model}")
            crew = Crew(
                agents=[agent],
                tasks=[task],
                verbose=False
            )

            # Run blocking kickoff in a separate thread
            result = await asyncio.to_thread(crew.kickoff)

            result_text = str(result) if result else "No result generated"
            tokens = len(text.split()) + len(result_text.split())

            logger.info("CrewAI execution completed successfully")
            return result_text, tokens

        except ImportError:
            logger.warning("crewAI not available, falling back to direct Groq API")
            return await self._process_with_groq(text, intent, options)
        except Exception as e:
            logger.error(f"CrewAI processing error: {e}")
            logger.info("Falling back to direct Groq API")
            return await self._process_with_groq(text, intent, options)

    async def _process_with_groq(
        self, text: str, intent: IntentType, options: Dict[str, Any]
    ) -> tuple[str, int]:
        """Process using direct Groq API call with model-specific configuration"""
        try:
            system_prompt = IntentDetector.get_system_prompt(intent)

            # Build basic request parameters
            temp = options.get("temperature")
            if temp is None:
                temp = self.model_config["default_temperature"]

            max_t = options.get("max_tokens")
            if max_t is None:
                max_t = self.model_config["max_tokens"]
            else:
                max_t = min(max_t, self.model_config["max_tokens"])

            request_params = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                "temperature": temp,
                "max_tokens": max_t,
                "top_p": options.get("top_p") or 1,
                "stream": False,
            }

            logger.info(f"Calling Groq API with model: {self.model}")
            logger.info(f"Temperature: {request_params['temperature']}, Max tokens: {request_params['max_tokens']}")

            response = await self.groq_client.chat.completions.create(**request_params)

            result = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            logger.info(f"Received response: {tokens} tokens used")
            return result, tokens

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise

    def _create_llm_config(self):
        """Create LLM configuration for crewAI"""
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            openai_api_base="https://api.groq.com/openai/v1",
            openai_api_key=self.api_key,
            model=self.model
        )

    def _get_agent_role(self, intent: IntentType) -> str:
        """Get agent role based on intent"""
        roles = {
            IntentType.SUMMARIZATION: "Text Summarization Expert",
            IntentType.TRANSLATION: "Professional Translator",
            IntentType.SENTIMENT: "Sentiment Analysis Specialist",
            IntentType.ENTITY_EXTRACTION: "Named Entity Recognition Expert",
            IntentType.TEXT_GENERATION: "Creative Content Writer",
            IntentType.CUSTOM: "AI Assistant",
        }
        return roles.get(intent, roles[IntentType.CUSTOM])

    def _get_agent_goal(self, intent: IntentType) -> str:
        """Get agent goal based on intent"""
        goals = {
            IntentType.SUMMARIZATION: "Provide clear, concise summaries that capture key information",
            IntentType.TRANSLATION: "Deliver accurate translations preserving meaning and tone",
            IntentType.SENTIMENT: "Analyze sentiment accurately with clear reasoning",
            IntentType.ENTITY_EXTRACTION: "Extract all relevant entities with high precision",
            IntentType.TEXT_GENERATION: "Generate high-quality, engaging content",
            IntentType.CUSTOM: "Assist users with their requests effectively",
        }
        return goals.get(intent, goals[IntentType.CUSTOM])

    def _get_agent_backstory(self, intent: IntentType) -> str:
        """Get agent backstory based on intent"""
        backstories = {
            IntentType.SUMMARIZATION: "You have years of experience distilling complex information into clear, actionable summaries.",
            IntentType.TRANSLATION: "You are fluent in multiple languages and understand cultural nuances in translation.",
            IntentType.SENTIMENT: "You have deep expertise in understanding emotional tone and sentiment in text.",
            IntentType.ENTITY_EXTRACTION: "You excel at identifying and categorizing named entities in text.",
            IntentType.TEXT_GENERATION: "You are a skilled writer capable of creating compelling content.",
            IntentType.CUSTOM: "You are a knowledgeable AI assistant ready to help with any task.",
        }
        return backstories.get(intent, backstories[IntentType.CUSTOM])

    def _get_expected_output(self, intent: IntentType) -> str:
        """Get expected output format based on intent"""
        outputs = {
            IntentType.SUMMARIZATION: "A concise summary of the main points",
            IntentType.TRANSLATION: "An accurate translation of the text",
            IntentType.SENTIMENT: "A sentiment analysis with classification and reasoning",
            IntentType.ENTITY_EXTRACTION: "A list of extracted entities with their types",
            IntentType.TEXT_GENERATION: "Well-written content matching the request",
            IntentType.CUSTOM: "A helpful response to the user's request",
        }
        return outputs.get(intent, outputs[IntentType.CUSTOM])

