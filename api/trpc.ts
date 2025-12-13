/**
 * Vercel Serverless Function for tRPC API
 * Fixed all import paths and type errors
 */
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ✅ CORRECTED IMPORT PATHS
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

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
    // Create handler for each request with proper path. The path should be the tRPC procedure path.
    // Extract the tRPC procedure path from the URL.
    // The Vercel rewrite rule in vercel.json maps /api/trpc/:path* to /api/trpc.
    // We need to extract the :path* part from the original URL.
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const path = url.pathname.replace("/api/trpc/", "");
    await nodeHTTPRequestHandler({
      router: appRouter,
      createContext: () => createContext({ req, res }),
      batching: { enabled: true },
      req,
      res,
      path,
    });
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
