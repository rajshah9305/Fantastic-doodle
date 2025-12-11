import Groq from "groq-sdk";

let groq: Groq | null = null;

/**
 * Validates and retrieves the Groq API key
 * Throws an error if key is missing or invalid
 */
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

/**
 * Singleton Groq client getter with lazy initialization
 * Ensures only one instance is created across the application
 */
export function getGroqClient(): Groq {
  if (!groq) {
    try {
      const apiKey = validateGroqApiKey();
      groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: false,
        timeout: 60000, // 60s timeout
        maxRetries: 3,
      });
    } catch (error) {
      groq = null;
      throw new Error(
        `Failed to initialize Groq client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  return groq;
}

function parseJsonResponse(text: string | null | undefined): Record<string, string> {
  if (!text) throw new Error("Empty response from AI");
  try {
    return JSON.parse(text);
  } catch {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\n?/g, "").replace(/\n?```$/g, "");
    cleaned = cleaned.replace(/^```\n?/g, "").replace(/\n?```$/g, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Invalid AI response format - no JSON found");
    const jsonStr = cleaned.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      throw new Error("Invalid AI response format after cleanup");
    }
  }
}

export async function generateAppFromPrompt(prompt: string): Promise<{
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  title: string;
}> {
  const systemPrompt = `You are an expert web developer creating production-quality web applications.
CRITICAL: Respond with ONLY valid JSON in a single line. No markdown, no code blocks, no explanations.
Format: {"title":"App Name","htmlCode":"<html>...</html>","cssCode":"body{...}","jsCode":"..."}

DESIGN REQUIREMENTS:
- Brutalist design: Primary orange (#ea580c), accents in red (#dc2626)
- Black (#000000) backgrounds with bold typography
- Thick borders (2-4px solid) throughout
- Hard drop shadows: 4px 4px 0px 0px rgba(0,0,0,1)
- No external CDNs, all code self-contained
- Modern ES6+ JavaScript with proper scoping

CODE QUALITY:
- Complete, fully-functional applications
- Proper semantic HTML5
- Comprehensive CSS with responsive design
- Extensive JavaScript features (event handlers, state management, animations)
- Professional error handling and user feedback
- Detailed comments explaining complex logic
- Mobile-responsive layout with media queries

IMPLEMENTATION DETAILS:
- Use flexbox/grid for layouts
- Implement smooth transitions and hover effects
- Add visual feedback for user interactions
- Create proper form validation
- Use const/let with arrow functions
- Implement array methods (map, filter, reduce) where relevant
- Add data persistence with localStorage if applicable
- Create reusable utility functions`;

  try {
    const client = getGroqClient();
    const message = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 65536,
      top_p: 1,
      reasoning_effort: "medium",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a professional web application for: ${prompt}\n\nMake it feature-rich with comprehensive functionality, smooth interactions, and professional styling.` },
      ],
    });
    
    if (!message?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Groq API - no content in message");
    }
    
    const responseText = message.choices[0].message.content;
    if (typeof responseText !== 'string') {
      throw new Error("Response content is not a string");
    }
    
    const parsed = parseJsonResponse(responseText);
    return {
      title: parsed.title || "Generated App",
      htmlCode: parsed.htmlCode || "<html><body>Error</body></html>",
      cssCode: parsed.cssCode || "",
      jsCode: parsed.jsCode || "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate app: ${message}`);
  }
}

export async function testGroqConnection(): Promise<string> {
  try {
    const client = getGroqClient();
    await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: "test" }],
      max_completion_tokens: 10,
    });
    return "connected";
  } catch (error) {
    return `failed: ${error instanceof Error ? error.message : "unknown"}`;
  }
}

export async function generateAppFromPromptStream(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<{
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  title: string;
}> {
  const systemPrompt = `You are an expert web developer creating production-quality web applications.
CRITICAL: Respond with ONLY valid JSON in a single line. No markdown, no code blocks, no explanations.
Format: {"title":"App Name","htmlCode":"<html>...</html>","cssCode":"body{...}","jsCode":"..."}

DESIGN REQUIREMENTS:
- Brutalist design: Primary orange (#ea580c), accents in red (#dc2626)
- Black (#000000) backgrounds with bold typography
- Thick borders (2-4px solid) throughout
- Hard drop shadows: 4px 4px 0px 0px rgba(0,0,0,1)
- No external CDNs, all code self-contained
- Modern ES6+ JavaScript with proper scoping

CODE QUALITY:
- Complete, fully-functional applications
- Proper semantic HTML5
- Comprehensive CSS with responsive design
- Extensive JavaScript features (event handlers, state management, animations)
- Professional error handling and user feedback
- Detailed comments explaining complex logic
- Mobile-responsive layout with media queries

IMPLEMENTATION DETAILS:
- Use flexbox/grid for layouts
- Implement smooth transitions and hover effects
- Add visual feedback for user interactions
- Create proper form validation
- Use const/let with arrow functions
- Implement array methods (map, filter, reduce) where relevant
- Add data persistence with localStorage if applicable
- Create reusable utility functions`;

  try {
    const client = getGroqClient();
    const stream = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 65536,
      top_p: 1,
      reasoning_effort: "medium",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a professional web application for: ${prompt}\n\nMake it feature-rich with comprehensive functionality, smooth interactions, and professional styling.` },
      ],
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content && typeof content === 'string') {
        fullResponse += content;
        onChunk(content);
      }
    }

    if (!fullResponse?.trim()) {
      throw new Error("Empty response from Groq API");
    }

    const parsed = parseJsonResponse(fullResponse);
    return {
      title: parsed.title || "Generated App",
      htmlCode: parsed.htmlCode || "<html><body>Error</body></html>",
      cssCode: parsed.cssCode || "",
      jsCode: parsed.jsCode || "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate app: ${message}`);
  }
}

export async function modifyAppWithAI(
  currentCode: string,
  instruction: string,
  originalPrompt: string
): Promise<{
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  title: string;
}> {
  const systemPrompt = `You are an expert web developer specializing in code modification and enhancement.
CRITICAL: Respond with ONLY valid JSON in a single line. No markdown, no code blocks, no explanations.
Format: {"title":"App Name","htmlCode":"<html>...</html>","cssCode":"body{...}","jsCode":"..."}

MODIFICATION GUIDELINES:
- Preserve the original design language and functionality
- Maintain brutalist design: orange (#ea580c), black (#000000), red (#dc2626)
- Keep existing features while adding requested enhancements
- Improve code quality and add missing functionality
- Enhance user experience with better interactions
- Add smooth animations and visual feedback
- Implement proper error handling
- Optimize performance where possible
- Add helpful comments to explain changes
- Ensure mobile responsiveness is maintained

CODE QUALITY STANDARDS:
- Professional, production-ready code
- Proper semantic HTML5 structure
- Comprehensive CSS with all necessary styles
- Advanced JavaScript with proper event handling
- Use modern ES6+ features (arrow functions, const/let, destructuring)
- Implement state management patterns
- Add localStorage for data persistence if applicable
- Create reusable, maintainable code`;

  try {
    const message = await getGroqClient().chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 65536,
      top_p: 1,
      reasoning_effort: "medium",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Original Application Concept: ${originalPrompt}\n\nCurrent Code:\n${currentCode}\n\nModification Request: ${instruction}\n\nEnhance and modify the application with the requested changes. Make it more feature-rich, polished, and professional.` },
      ],
    });
    
    if (!message?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Groq API - no content in message");
    }
    
    const responseText = message.choices[0].message.content;
    if (typeof responseText !== 'string') {
      throw new Error("Response content is not a string");
    }
    
    const parsed = parseJsonResponse(responseText);
    return {
      title: parsed.title || "Modified App",
      htmlCode: parsed.htmlCode || "<html><body>Error</body></html>",
      cssCode: parsed.cssCode || "",
      jsCode: parsed.jsCode || "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to modify app: ${message}`);
  }
}
