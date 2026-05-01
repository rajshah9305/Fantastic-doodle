import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

// Define CORS configuration
const corsConfig = {
  origin: "*",
  methods: "GET, POST, OPTIONS",
  headers: "Content-Type",
};

// Define error response
const errorResponse = {
  error: { message: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || corsConfig.origin);
  res.setHeader("Access-Control-Allow-Methods", corsConfig.methods);
  res.setHeader("Access-Control-Allow-Headers", corsConfig.headers);

  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Parse URL and path
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const path = url.pathname.replace("/api/trpc/", "");

    // Handle tRPC request
    await nodeHTTPRequestHandler({
      router: appRouter,
      createContext: () => createContext({ req, res }),
      batching: { enabled: true },
      req,
      res,
      path,
    });
  } catch (error) {
    // Send error response if headers not sent
    if (!res.headersSent) {
      res.status(500).json(errorResponse);
    }
  }
}
