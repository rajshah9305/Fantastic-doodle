# Error Handling Guide

## Overview

This document outlines the error handling patterns and best practices used throughout the AI STUDIO application.

## Error Handling Patterns

### 1. Server-Side Error Handling

#### API Validation Errors

All API inputs are validated using Zod schemas. Invalid inputs return descriptive error messages:

```typescript
// Example: Invalid prompt length
{
  code: "BAD_REQUEST",
  message: "Prompt must be at least 10 characters"
}
```

#### Database Errors

Database operations gracefully handle missing database connections:

```typescript
export async function getDb() {
  if (process.env.VERCEL || !process.env.DATABASE_URL) {
    console.log("[Database] Running without database (serverless mode)");
    return null;
  }
  // ... database initialization
}
```

#### API Integration Errors

Groq API errors are caught and wrapped with meaningful messages:

```typescript
try {
  const message = await getGroqClient().chat.completions.create({
    // ... request
  });
} catch (error) {
  throw new Error(
    `Failed to generate app: ${error instanceof Error ? error.message : "Unknown error"}`
  );
}
```

### 2. Client-Side Error Handling

#### React Component Error Boundaries

The application uses an ErrorBoundary component to catch React errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### tRPC Error Handling

All mutations and queries include error handlers:

```typescript
const generateMutation = trpc.apps.generate.useMutation({
  onSuccess: data => {
    setIsGenerating(false);
    setGeneratedApp(data);
    toast.success("✨ App generated successfully!");
  },
  onError: error => {
    setIsGenerating(false);
    console.error("Generation error:", error);
    toast.error(`Error: ${error.message}`);
  },
});
```

#### Null Checks

All potentially null values are checked before use:

```typescript
// FIX: Add null checks to prevent runtime errors
if (!generatedApp) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <h2 className="text-2xl font-bold text-foreground">No App Generated</h2>
    </div>
  );
}
```

### 3. Input Validation

#### Zod Schemas

All API inputs are validated using Zod:

```typescript
export const GenerateAppInputSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must not exceed 2000 characters"),
  sessionId: z.string().optional(),
});
```

#### Client-Side Validation

Before sending requests, validate on the client:

```typescript
const handleGenerate = async () => {
  if (!prompt.trim()) {
    toast.error("Please describe your app");
    return;
  }
  // ... proceed with mutation
};
```

## Common Error Scenarios

### 1. Missing GROQ_API_KEY

**Error Message:**

```
❌ GROQ_API_KEY environment variable is required. Please add it to your .env file.
```

**Solution:**

1. Create a `.env` file in the project root
2. Add your Groq API key: `GROQ_API_KEY=your_key_here`
3. Restart the development server

### 2. Invalid Prompt

**Error Message:**

```
Prompt must be at least 10 characters
```

**Solution:**

- Ensure the prompt is descriptive and at least 10 characters long
- Example: "A todo list app with add, delete, and mark complete functionality"

### 3. App Not Found

**Error Message:**

```
App not found
```

**Solution:**

- Verify the app ID is correct
- Check if the app was deleted
- Refresh the page to get the latest app list

### 4. Database Connection Error

**Error Message:**

```
[Database] Failed to connect: Error message
```

**Solution:**

- In serverless environments (Vercel), the app runs without a database
- For local development, ensure DATABASE_URL is set in .env
- Example: `DATABASE_URL=sqlite://db.sqlite`

### 5. Network Error

**Error Message:**

```
Failed to generate app: Network error
```

**Solution:**

- Check internet connection
- Verify Groq API is accessible
- Check for CORS issues in browser console

## Logging Strategy

### Development Logging

In development mode, detailed logs are printed to the console:

```typescript
console.log("[Database] Connected successfully to:", dbPath);
console.error("[Database] Failed to connect:", error);
```

### Production Logging

In production, errors are logged but sensitive information is redacted:

```typescript
console.error("Error calling Groq API:", error);
// Avoid logging API keys or sensitive data
```

## Future Improvements

1. **Structured Logging:** Implement structured logging with timestamps and severity levels
2. **Error Tracking:** Integrate with Sentry or similar for error tracking
3. **Rate Limiting:** Add rate limiting to prevent API abuse
4. **Request Validation:** Add request size limits and timeout handling
5. **Retry Logic:** Implement exponential backoff for failed API calls

## Testing Error Scenarios

### Manual Testing

1. **Missing API Key:**
   - Remove GROQ_API_KEY from .env
   - Try to generate an app
   - Should see error message

2. **Invalid Input:**
   - Try to generate with a prompt less than 10 characters
   - Should see validation error

3. **Network Error:**
   - Disconnect from internet
   - Try to generate an app
   - Should see network error message

### Automated Testing

```typescript
// Example test for error handling
test("should handle missing API key", async () => {
  delete process.env.GROQ_API_KEY;
  expect(() => getGroqClient()).toThrow(
    "GROQ_API_KEY environment variable is required"
  );
});
```

## References

- [Zod Documentation](https://zod.dev/)
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
