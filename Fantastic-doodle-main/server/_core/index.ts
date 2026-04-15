import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { config } from "../utils/config";
import { logger, requestLogger } from "../utils/logging";

// Validate config on startup
config.load();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(requestLogger);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Streaming generate endpoint (SSE)
  app.post("/api/generate-stream", async (req, res) => {
    try {
      const { prompt, sessionId } = req.body as { prompt: string; sessionId: string };
      if (!prompt || !sessionId) {
        res.status(400).json({ error: "prompt and sessionId are required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const { getGroqClient } = await import("../groqClient.js");
      const { DEFAULT_MODEL } = await import("../../shared/models.js");

      const SYSTEM_PROMPT = `You are an expert full-stack web developer and UI/UX designer. Your job is to generate complete, functional, and visually stunning single-page web applications exactly as the user describes.

Return ONLY a valid JSON object with no extra text, markdown, or explanation.
Required JSON structure:
{
  "title": "App Name",
  "description": "Brief description",
  "htmlCode": "<html structure with semantic markup>",
  "cssCode": "/* Complete styling */",
  "jsCode": "// Complete functionality"
}

CORE RULES — follow these without exception:
1. USER INTENT IS LAW. If the user specifies a style, color, layout, or theme — implement it exactly. Never override or ignore explicit user instructions.
2. If the user does NOT specify a visual style, apply a modern, polished default: clean typography, subtle gradients or glassmorphism, smooth transitions, and a cohesive color palette derived from the app's purpose.
3. Every app must feel UNIQUE and CRAFTED — not generic. Avoid cookie-cutter layouts. Use creative spacing, micro-interactions, and thoughtful visual hierarchy.
4. NEVER produce a plain, unstyled, or minimal-effort result. Every output should look like a real product.

TECHNICAL REQUIREMENTS:
- Self-contained: No external dependencies except system fonts (use @import for Google Fonts if needed via CSS).
- Modern Code: ES6+ JavaScript, CSS custom properties, Grid, Flexbox, and smooth transitions.
- No placeholder images: Use CSS gradients, SVG icons, or emoji as visual elements.
- Fully functional: All interactive elements must work. No stub functions or TODO comments.
- Responsive: Mobile-first layout using CSS Grid/Flexbox.
- Accessible: Semantic HTML, proper contrast ratios, focus states on interactive elements.
- Polished details: Hover states, loading states where relevant, smooth animations (prefer CSS transitions over JS).

QUALITY BAR:
- The app should look like it was built by a senior developer at a top-tier product company.
- Spacing must be generous and intentional — never cramped.
- Typography must be readable and hierarchical.
- Color usage must be consistent and purposeful.`;

      const stream = await getGroqClient().chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate a web application exactly as described: ${prompt}` },
        ],
        model: DEFAULT_MODEL,
        temperature: 0.5,
        max_completion_tokens: 8192,
        top_p: 1,
        response_format: { type: "json_object" },
        stream: true,
        stream_options: { include_usage: false },
      });

      let fullText = "";
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? "";
        if (token) {
          fullText += token;
          // SSE: each token as a separate event
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      // Final event with complete accumulated text
      res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(config.get("PORT"));
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn("Server", `Port ${preferredPort} busy, using ${port} instead`);
  }

  server.listen(port, () => {
    logger.info("Server", `Running on http://localhost:${port}/`, {
      environment: config.get("NODE_ENV"),
      hasDatabase: config.hasDatabaseUrl(),
    });
  });
}

startServer().catch(err => {
  logger.error("Server", "Failed to start server", err);
  process.exit(1);
});
