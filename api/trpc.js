// Vercel serverless function for tRPC API
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import Groq from 'groq-sdk';
import { z } from 'zod';
import superjson from 'superjson';

if (!process.env.GROQ_API_KEY) {
  throw new Error('❌ GROQ_API_KEY environment variable is required. Please add it to your Vercel environment variables.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Simple JSON parser for LLM responses
function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\n?/g, '').replace(/\n?```$/g, '');
    cleaned = cleaned.replace(/^```\n?/g, '').replace(/\n?```$/g, '');
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON object found in response');
      }
      let jsonStr = cleaned.substring(startIdx, endIdx + 1);
      const parts = jsonStr.split('"');
      for (let i = 1; i < parts.length; i += 2) {
        parts[i] = parts[i].replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      }
      jsonStr = parts.join('"');
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
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
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 8192,
      top_p: 1,
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
      htmlCode: parsedResponse.htmlCode || "<html><body>Error generating HTML</body></html>",
      cssCode: parsedResponse.cssCode || "",
      jsCode: parsedResponse.jsCode || "",
    };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Failed to generate app: ${error.message}`);
  }
}

// Modify app with AI
async function modifyAppWithAI(currentCode, instruction, originalPrompt) {
  const systemPrompt = `You are an expert web developer. You will receive existing HTML/CSS/JavaScript code and a modification instruction. Update the code according to the instruction while maintaining functionality.

Your response MUST be ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "title": "App Name",
  "htmlCode": "updated HTML code here",
  "cssCode": "updated CSS code here",
  "jsCode": "updated JavaScript code here"
}

Guidelines:
- Preserve the overall structure and functionality
- Make only the requested changes
- Ensure the code remains self-contained
- Use modern ES6+ JavaScript syntax
- Do NOT use external CDN links or require npm packages
- Escape all special characters properly in JSON strings
- For code strings, use actual newlines (do not escape them in the JSON - the parser will handle it)

CRITICAL DESIGN REQUIREMENTS - BRUTALIST ORANGE/BLACK THEME:
- Maintain brutalist/industrial design aesthetic with sharp edges and bold typography
- Primary color palette: Orange (#ea580c, #f97316, #fb923c) and Black (#000000, #0a0a0a, #171717)
- Background colors: Use black (#000000), very dark gray (#0a0a0a, #171717), or white (#ffffff) for contrast
- Accent colors: Orange shades for buttons, highlights, borders, and interactive elements
- Typography: Use bold, sans-serif fonts with high contrast
- Borders: Use thick borders (2-4px) with orange or black colors
- Shadows: Use hard box-shadows like "4px 4px 0px 0px rgba(0,0,0,1)" for brutalist effect
- Buttons: Orange background (#ea580c) with black text, thick borders, and hard shadows
- Interactive states: On hover, shift shadows and translate elements slightly
- NO pastel colors, NO soft gradients, NO subtle shadows - keep it bold and industrial`;

  try {
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 8192,
      top_p: 1,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Original app requirements: ${originalPrompt}\n\nCurrent code:\n${currentCode}\n\nModification instruction: ${instruction}`,
        },
      ],
    });

    const responseText = message.choices[0].message.content || "";
    const parsedResponse = parseJsonResponse(responseText);

    return {
      title: parsedResponse.title || "Modified App",
      htmlCode: parsedResponse.htmlCode || "<html><body>Error generating HTML</body></html>",
      cssCode: parsedResponse.cssCode || "",
      jsCode: parsedResponse.jsCode || "",
    };
  } catch (error) {
    console.error("Error modifying app with Groq API:", error);
    throw new Error(`Failed to modify app: ${error.message}`);
  }
}

// tRPC router
const appRouter = router({
  apps: router({
    generate: publicProcedure
      .input(z.object({
        prompt: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const generated = await generateAppFromPrompt(input.prompt);
        return {
          success: true,
          sessionId: `vercel-${Date.now()}`,
          ...generated,
        };
      }),
    
    modify: publicProcedure
      .input(z.object({
        currentCode: z.string(),
        instruction: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const modified = await modifyAppWithAI(
          input.currentCode,
          input.instruction,
          "Modification Request"
        );
        return {
          success: true,
          ...modified,
        };
      }),
  }),
});

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => ({}),
    });

    const body = await response.json();
    res.status(response.status).json(body);
  } catch (error) {
    console.error('tRPC handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
