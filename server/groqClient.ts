import Groq from "groq-sdk";

let groq: Groq | null = null;

function validateGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GROQ_API_KEY is required. Add it to your .env file and restart the server."
    );
  }
  const trimmedKey = apiKey.trim();
  if (trimmedKey.length < 10) {
    throw new Error(
      "Invalid GROQ_API_KEY: Key appears incomplete (minimum 10 characters)."
    );
  }
  return trimmedKey;
}

export function getGroqClient(): Groq {
  if (!groq) {
    const apiKey = validateGroqApiKey();
    groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: false,
      timeout: 60000,
      maxRetries: 3,
    });
  }
  return groq;
}
