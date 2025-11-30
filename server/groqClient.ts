import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Safely parse JSON from LLM response, handling escaped newlines and special characters
 */
function parseJsonResponse(text: string): Record<string, string> {
  try {
    // Try direct parsing first
    return JSON.parse(text);
  } catch (error) {
    // If that fails, try to fix common issues with LLM-generated JSON
    let cleaned = text.trim();

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\n?/g, "").replace(/\n?```$/g, "");
    cleaned = cleaned.replace(/^```\n?/g, "").replace(/\n?```$/g, "");
    cleaned = cleaned.trim();

    // Try parsing again
    try {
      return JSON.parse(cleaned);
    } catch {
      // If still failing, try to extract and fix the JSON more aggressively
      // Find the JSON object boundaries
      const startIdx = cleaned.indexOf("{");
      const endIdx = cleaned.lastIndexOf("}");

      if (startIdx === -1 || endIdx === -1) {
        console.error("Failed to parse JSON. Response text:", cleaned.substring(0, 200));
        throw new Error("No JSON object found in response");
      }

      let jsonStr = cleaned.substring(startIdx, endIdx + 1);

      // Fix common JSON issues
      // 1. Handle unescaped newlines inside strings by replacing them with escaped versions
      // Split by quotes to identify string boundaries
      const parts = jsonStr.split('"');
      for (let i = 1; i < parts.length; i += 2) {
        // Odd indices are inside strings
        parts[i] = parts[i].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      }
      jsonStr = parts.join('"');

      // 2. Remove any trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

      try {
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse fixed JSON:", jsonStr.substring(0, 300));
        throw new Error(
          `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
        );
      }
    }
  }
}

/**
 * Generate HTML/CSS/JS code from a natural language prompt using Groq API
 * Returns an object with separate HTML, CSS, and JS code sections
 */
export async function generateAppFromPrompt(prompt: string): Promise<{
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  title: string;
}> {
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
- For code strings, use actual newlines (do not escape them in the JSON - the parser will handle it)`;

  try {
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
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

    // Extract the text content from the response
    const responseText = message.choices[0].message.content || "";

    // Parse the JSON response with improved error handling
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
    throw new Error(
      `Failed to generate app: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate HTML/CSS/JS code from a natural language prompt using Groq API with streaming support
 * Yields chunks of the response as they arrive
 */
export async function* generateAppFromPromptStreaming(
  prompt: string
): AsyncGenerator<string, void, unknown> {
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
- Escape all special characters properly in JSON strings`;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
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

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Error calling Groq API with streaming:", error);
    throw new Error(
      `Failed to generate app: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate app code with tool use capabilities (browser search, code interpreter)
 * This implements the user's Python snippet pattern with streaming and tools
 */
export async function* generateAppWithTools(
  prompt: string,
  tools: Array<{ type: "browser_search" | "code_interpreter" }> = [
    { type: "browser_search" },
    { type: "code_interpreter" },
  ]
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = `You are an expert web developer with access to tools for research and code execution. When given a natural language description of a web application, generate clean, modern HTML, CSS, and JavaScript code that implements it.

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
- Make sure all code is production-ready`;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
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
      tools: tools.map((tool) => ({
        type: tool.type,
      })),
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Error calling Groq API with tools:", error);
    throw new Error(
      `Failed to generate app: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Modify existing app code based on user instructions
 */
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
- For code strings, use actual newlines (do not escape them in the JSON - the parser will handle it)`;

  try {
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
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
      htmlCode:
        parsedResponse.htmlCode ||
        "<html><body>Error generating HTML</body></html>",
      cssCode: parsedResponse.cssCode || "",
      jsCode: parsedResponse.jsCode || "",
    };
  } catch (error) {
    console.error("Error modifying app with Groq API:", error);
    throw new Error(
      `Failed to modify app: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Modify existing app code with streaming support
 */
export async function* modifyAppWithAIStreaming(
  currentCode: string,
  instruction: string,
  originalPrompt: string
): AsyncGenerator<string, void, unknown> {
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
- Do NOT use external CDN links or require npm packages`;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
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

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Error modifying app with Groq API (streaming):", error);
    throw new Error(
      `Failed to modify app: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate that the Groq API is accessible and working
 */
export async function validateGroqConnection(): Promise<boolean> {
  try {
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say 'OK' only.",
        },
      ],
    });

    const content = message.choices[0].message.content || "";
    return content.includes("OK");
  } catch (error) {
    console.error("Groq API validation failed:", error);
    return false;
  }
}

/**
 * Test the Groq API client with a simple request
 */
export async function testGroqAPI(): Promise<string> {
  try {
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Say hello and confirm the Groq API is working.",
        },
      ],
    });

    return message.choices[0].message.content || "No response";
  } catch (error) {
    throw new Error(
      `Groq API test failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
