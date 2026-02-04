/**
 * Simple test endpoint to check environment variables
 * Visit: /api/test-env
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const groqKey = process.env.GROQ_API_KEY;
  const dbUrl = process.env.DATABASE_URL;
  
  res.status(200).json({
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    checks: {
      groqKeyExists: !!groqKey,
      groqKeyLength: groqKey?.length || 0,
      groqKeyPrefix: groqKey?.substring(0, 10) || "none",
      groqKeyValid: groqKey?.startsWith("gsk_") || false,
      dbUrlExists: !!dbUrl,
    },
    envVars: Object.keys(process.env).filter(
      k => !k.includes('SECRET') && 
           !k.includes('PASSWORD') && 
           !k.includes('TOKEN') &&
           !k.includes('KEY')
    ),
    message: groqKey 
      ? "✅ GROQ_API_KEY is loaded" 
      : "❌ GROQ_API_KEY is NOT loaded - Add it in Vercel settings and redeploy"
  });
}
