// Vercel serverless function for tRPC API
import Groq from "groq-sdk";
import superjson from "superjson";

if (!process.env.GROQ_API_KEY) {
  throw new Error(
    "❌ GROQ_API_KEY environment variable is required. Please add it to your Vercel environment variables."
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simple JSON parser for LLM responses
function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\n?/g, "").replace(/\n?```$/g, "");
    cleaned = cleaned.replace(/^```\n?/g, "").replace(/\n?```$/g, "");
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const startIdx = cleaned.indexOf("{");
      const endIdx = cleaned.lastIndexOf("}");
      if (startIdx === -1 || endIdx === -1) {
        throw new Error("No JSON object found in response");
      }
      let jsonStr = cleaned.substring(startIdx, endIdx + 1);
      const parts = jsonStr.split('"');
      for (let i = 1; i < parts.length; i += 2) {
        parts[i] = parts[i].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      }
      jsonStr = parts.join('"');
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(jsonStr);
    }
  }
}

// Generate app from prompt
async function generateAppFromPrompt(prompt) {
  const systemPrompt = `You are an expert web developer. When given a natural language description of a web application, generate clean, modern HTML, CSS, and JavaScript code that implements it.

Your response MUST be ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "title": "App Name",
  "htmlCode": "complete HTML code here",
  "cssCode": "CSS code here",
  "jsCode": "JavaScript code here"
}

Guidelines:
- Create responsive, modern designs using CSS Flexbox/Grid
- Use semantic HTML5 elements
- Include proper error handling in JavaScript
- Make the app functional and interactive
- Use inline styles or a <style> tag in HTML
- Keep JavaScript modular and well-commented
- Ensure the app is self-contained and works standalone
- Use modern ES6+ JavaScript syntax
- Do NOT use external CDN links or require npm packages
- Make sure all code is production-ready
- Escape all special characters properly in JSON strings
- For code strings, use actual newlines (do not escape them in the JSON - the parser will handle it)

CRITICAL DESIGN REQUIREMENTS - BRUTALIST ORANGE/BLACK THEME:
- Use a brutalist/industrial design aesthetic with sharp edges and bold typography
- Primary color palette: Orange (#ea580c, #f97316, #fb923c) and Black (#000000, #0a0a0a, #171717)
- Background colors: Use black (#000000), very dark gray (#0a0a0a, #171717), or white (#ffffff) for contrast
- Accent colors: Orange shades for buttons, highlights, borders, and interactive elements
- Typography: Use bold, sans-serif fonts with high contrast
- Borders: Use thick borders (2-4px) with orange or black colors
- Shadows: Use hard box-shadows like "4px 4px 0px 0px rgba(0,0,0,1)" for brutalist effect
- Buttons: Orange background (#ea580c) with black text, thick borders, and hard shadows
- Interactive states: On hover, shift shadows and translate elements slightly
- Layout: Use grid patterns, sharp corners, no rounded edges (or minimal rounding)
- Text: High contrast - white/light text on dark backgrounds, black text on light backgrounds
- NO pastel colors, NO soft gradients, NO subtle shadows - keep it bold and industrial`;

  try {
    const message = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      reasoning_effort: "medium",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a web application with the following requirements:\n\n${prompt}`,
        },
      ],
    });

    const responseText = message.choices[0].message.content || "";
    const parsedResponse = parseJsonResponse(responseText);

    return {
      title: parsedResponse.title || "Generated App",
      htmlCode:
        parsedResponse.htmlCode ||
        "<html><body>Error generating HTML</body></html>",
      cssCode: parsedResponse.cssCode || "",
      jsCode: parsedResponse.jsCode || "",
    };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Failed to generate app: ${error.message}`);
  }
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the tRPC request
    const body = req.body;

    // Handle batch requests (tRPC sends batched requests)
    if (Array.isArray(body)) {
      const results = [];
      for (const request of body) {
        if (request.method === "mutation" && request.path === "apps.generate") {
          const { prompt } = request.params.input;
          const result = await generateAppFromPrompt(prompt);
          const data = {
            success: true,
            sessionId: "temp-session",
            ...result,
          };
          results.push({
            result: {
              data: superjson.serialize(data),
            },
          });
        } else {
          results.push({
            error: {
              message: "Endpoint not implemented",
              code: -32601,
            },
          });
        }
      }
      return res.status(200).json(results);
    }

    // Handle single request
    if (body.method === "mutation" && body.path === "apps.generate") {
      const { prompt } = body.params.input;
      const result = await generateAppFromPrompt(prompt);
      const data = {
        success: true,
        sessionId: "temp-session",
        ...result,
      };
      return res.status(200).json({
        result: {
          data: superjson.serialize(data),
        },
      });
    }

    // Default response for unimplemented endpoints
    return res.status(200).json({
      error: {
        message: "Endpoint not implemented",
        code: -32601,
      },
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        code: -32603,
      },
    });
  }
}
