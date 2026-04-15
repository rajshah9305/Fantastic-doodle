import re
from typing import Tuple

from app.models import IntentType


class IntentDetector:
    """Detects user intent from natural language input"""

    # Intent detection patterns
    PATTERNS = {
        IntentType.SUMMARIZATION: [
            r'\b(summarize|summary|tldr|brief|condense|overview)\b',
            r'\bsum(marize)?\s+(this|the|following)\b',
        ],
        IntentType.TRANSLATION: [
            r'\b(translate|translation|convert)\b.*\b(to|into|in)\b.*\b(language|english|spanish|french|german|chinese|japanese)\b',
            r'\b(english|spanish|french|german|chinese|japanese)\s+to\s+(english|spanish|french|german|chinese|japanese)\b',
        ],
        IntentType.SENTIMENT: [
            r'\b(sentiment|emotion|feeling|tone|mood)\b',
            r'\b(positive|negative|neutral)\b.*\b(analysis|analyze)\b',
            r'\banalyze\b.*\b(sentiment|emotion|feeling)\b',
        ],
        IntentType.ENTITY_EXTRACTION: [
            r'\b(extract|find|identify|list)\b.*\b(entities|names|people|organizations|locations|dates)\b',
            r'\b(named entity|ner|entity recognition)\b',
        ],
        IntentType.TEXT_GENERATION: [
            r'\b(generate|create|write|compose|draft)\b',
            r'\b(story|article|essay|email|letter|content)\b',
        ],
    }

    @classmethod
    def detect(cls, text: str) -> Tuple[IntentType, float]:
        """
        Detect intent from input text

        Returns:
            Tuple of (intent, confidence_score)
        """
        text_lower = text.lower()

        # Check each intent pattern
        scores = {}
        for intent, patterns in cls.PATTERNS.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    score += 1
            if score > 0:
                scores[intent] = score / len(patterns)

        # Return highest scoring intent
        if scores:
            best_intent = max(scores.items(), key=lambda x: x[1])
            return best_intent[0], best_intent[1]

        # Default to custom if no clear intent
        return IntentType.CUSTOM, 0.5

    @classmethod
    def get_system_prompt(cls, intent: IntentType) -> str:
        """Get system prompt for specific intent"""
        prompts = {
            IntentType.SUMMARIZATION: "You are an expert at summarizing text. Provide a clear, concise summary that captures the key points.",
            IntentType.TRANSLATION: "You are an expert translator. Translate the text accurately while preserving meaning and tone.",
            IntentType.SENTIMENT: "You are an expert at sentiment analysis. Analyze the sentiment and provide a clear assessment (positive, negative, or neutral) with reasoning.",
            IntentType.ENTITY_EXTRACTION: "You are an expert at named entity recognition. Extract and list all relevant entities (people, organizations, locations, dates, etc.) from the text.",
            IntentType.TEXT_GENERATION: "You are an expert writer. Generate high-quality, coherent text based on the request.",
            IntentType.CUSTOM: "You are a highly capable AI assistant with expertise in natural language processing. Understand the user's request and provide accurate, helpful, and comprehensive responses. You can handle any NLP task including but not limited to: text analysis, content generation, question answering, data extraction, code generation, creative writing, problem solving, and more. Adapt your response style and depth based on the specific request.",
        }
        return prompts.get(intent, prompts[IntentType.CUSTOM])
