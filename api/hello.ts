/**
 * Simplest possible test endpoint
 * Visit: /api/hello
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const hasKey = !!process.env.GROQ_API_KEY;
  const keyLength = process.env.GROQ_API_KEY?.length || 0;
  
  res.status(200).json({
    status: "ok",
    message: hasKey ? "API key is loaded!" : "API key is MISSING!",
    hasGroqKey: hasKey,
    keyLength: keyLength,
    allEnvKeys: Object.keys(process.env).sort()
  });
}
