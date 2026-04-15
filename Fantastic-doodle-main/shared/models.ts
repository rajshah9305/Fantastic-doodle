/**
 * AWS Bedrock inference profile models (US region, ON_DEMAND, text output).
 * These are the available models for AI generation and modification.
 * The DEFAULT_MODEL is used server-side for all requests.
 */

export interface BedrockModel {
  id: string;
  name: string;
  provider: string;
}

export const BEDROCK_MODELS: BedrockModel[] = [
  // Anthropic Claude
  { id: "us.anthropic.claude-sonnet-4-20250514-v1:0", name: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0", name: "Claude 3.7 Sonnet", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-5-sonnet-20241022-v2:0", name: "Claude 3.5 Sonnet v2", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-5-sonnet-20240620-v1:0", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-5-haiku-20241022-v1:0", name: "Claude 3.5 Haiku", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-haiku-20240307-v1:0", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-sonnet-20240229-v1:0", name: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "us.anthropic.claude-3-opus-20240229-v1:0", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "us.anthropic.claude-opus-4-20250514-v1:0", name: "Claude Opus 4", provider: "Anthropic" },
  { id: "us.anthropic.claude-haiku-4-5-20251001-v1:0", name: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "us.anthropic.claude-sonnet-4-5-20250929-v1:0", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "global.anthropic.claude-sonnet-4-20250514-v1:0", name: "Claude Sonnet 4 (Global)", provider: "Anthropic" },
  // Amazon Nova
  { id: "us.amazon.nova-premier-v1:0", name: "Nova Premier", provider: "Amazon" },
  { id: "us.amazon.nova-pro-v1:0", name: "Nova Pro", provider: "Amazon" },
  { id: "us.amazon.nova-lite-v1:0", name: "Nova Lite", provider: "Amazon" },
  { id: "us.amazon.nova-micro-v1:0", name: "Nova Micro", provider: "Amazon" },
  { id: "us.amazon.nova-2-lite-v1:0", name: "Nova 2 Lite", provider: "Amazon" },
  // Meta Llama
  { id: "us.meta.llama4-maverick-17b-instruct-v1:0", name: "Llama 4 Maverick 17B", provider: "Meta" },
  { id: "us.meta.llama4-scout-17b-instruct-v1:0", name: "Llama 4 Scout 17B", provider: "Meta" },
  { id: "us.meta.llama3-3-70b-instruct-v1:0", name: "Llama 3.3 70B", provider: "Meta" },
  { id: "us.meta.llama3-2-90b-instruct-v1:0", name: "Llama 3.2 90B", provider: "Meta" },
  { id: "us.meta.llama3-2-11b-instruct-v1:0", name: "Llama 3.2 11B", provider: "Meta" },
  { id: "us.meta.llama3-1-70b-instruct-v1:0", name: "Llama 3.1 70B", provider: "Meta" },
  { id: "us.meta.llama3-1-8b-instruct-v1:0", name: "Llama 3.1 8B", provider: "Meta" },
  // Mistral
  { id: "us.mistral.pixtral-large-2502-v1:0", name: "Mistral Pixtral Large 25.02", provider: "Mistral" },
  // DeepSeek
  { id: "us.deepseek.r1-v1:0", name: "DeepSeek R1", provider: "DeepSeek" },
  // Writer Palmyra
  { id: "us.writer.palmyra-x4-v1:0", name: "Palmyra X4", provider: "Writer" },
  { id: "us.writer.palmyra-x5-v1:0", name: "Palmyra X5", provider: "Writer" },
  // NVIDIA
  { id: "nvidia.nemotron-nano-12b-v2", name: "Nemotron Nano 12B v2", provider: "NVIDIA" },
];

/**
 * Default model used for all AI generation/modification requests.
 * Using Groq's llama-3.3-70b-versatile as the active backend is Groq.
 * Switch to a BEDROCK_MODELS id when migrating to AWS Bedrock.
 */
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";
