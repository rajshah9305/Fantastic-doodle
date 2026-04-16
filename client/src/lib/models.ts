export const AI_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)" },
  { id: "openai/gpt-oss-120b", name: "OpenAI GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b", name: "OpenAI GPT-OSS 20B" },
] as const;

export type AIModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_AI_MODEL: AIModelId = "llama-3.3-70b-versatile";

export function getDefaultAiModel(): AIModelId {
  return DEFAULT_AI_MODEL;
}
