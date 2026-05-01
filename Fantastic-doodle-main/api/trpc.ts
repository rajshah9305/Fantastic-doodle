import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || "";
  // Allow same-origin and configured origins; tighten in production as needed
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
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
    if (!res.headersSent) {
      res.status(500).json({
        error: { message: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }
}
