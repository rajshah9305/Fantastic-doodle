import { describe, expect, it } from "vitest";
import { validateGroqConnection, generateAppFromPrompt } from "./groqClient";

describe("Groq API Integration", () => {
  it("should validate Groq API connection", async () => {
    const isConnected = await validateGroqConnection();
    expect(isConnected).toBe(true);
  });

  it("should generate app code from a simple prompt", async () => {
    const prompt = "Create a simple counter app with increment and decrement buttons";
    const result = await generateAppFromPrompt(prompt);

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("htmlCode");
    expect(result).toHaveProperty("cssCode");
    expect(result).toHaveProperty("jsCode");

    expect(result.title).toBeTruthy();
    expect(result.htmlCode).toContain("<html") || expect(result.htmlCode).toContain("<HTML");
    expect(typeof result.cssCode).toBe("string");
    expect(typeof result.jsCode).toBe("string");
  });

  it("should handle complex app generation", async () => {
    const prompt =
      "Create a todo list app with add, delete, and mark complete functionality. Use a clean modern design.";
    const result = await generateAppFromPrompt(prompt);

    expect(result.title).toBeTruthy();
    expect(result.htmlCode.length).toBeGreaterThan(100);
  });
});
