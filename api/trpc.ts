/**
 * Vercel Serverless Function for tRPC API
 * Fixed all import paths and type errors
 */
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ✅ CORRECTED IMPORT PATHS
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

// Create the tRPC handler
const trpcHandler = nodeHTTPRequestHandler({
  router: appRouter,
  createContext,
  batching: { enabled: true },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Debug logging
  console.log("[Vercel] tRPC request:", {
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    envExists: !!process.env.GROQ_API_KEY,
    envLength: process.env.GROQ_API_KEY?.length || 0,
  });

  // CORS headers - Replace * with your frontend URL in production!
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    await trpcHandler(req, res);
  } catch (error) {
    console.error("[Vercel] Unhandled error:", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    }
  }
}
