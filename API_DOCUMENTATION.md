# API Documentation

## Overview

This document describes the tRPC API endpoints available in the AI STUDIO application.

## Base URL

- Development: `http://localhost:3000/api/trpc`
- Production: `https://your-domain.com/api/trpc`

## Authentication

All endpoints are currently public (no authentication required). In production, consider implementing:

- API key authentication
- Rate limiting
- Request validation

## Endpoints

### Apps Router

#### 1. Generate App

**Endpoint:** `apps.generate`

**Type:** Mutation

**Input Schema:**

```typescript
{
  prompt: string;           // Required: 10-2000 characters
  sessionId?: string;       // Optional: Session identifier
}
```

**Response:**

```typescript
{
  success: boolean;
  sessionId: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}
```

**Error Handling:**

- Returns error if prompt is less than 10 characters
- Returns error if prompt exceeds 2000 characters
- Returns error if GROQ_API_KEY is not configured

**Example:**

```javascript
const result = await trpc.apps.generate.mutate({
  prompt: "A todo list app with add, delete, and mark complete functionality",
});
```

---

#### 2. Modify App

**Endpoint:** `apps.modify`

**Type:** Mutation

**Input Schema:**

```typescript
{
  id: number; // Required: Positive integer
  prompt: string; // Required: 5-2000 characters
}
```

**Response:**

```typescript
{
  success: boolean;
  id: number;
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}
```

**Error Handling:**

- Returns error if app ID is not found
- Returns error if modification prompt is invalid

**Example:**

```javascript
const result = await trpc.apps.modify.mutate({
  id: 1,
  prompt: "Add a dark mode toggle",
});
```

---

#### 3. Update App

**Endpoint:** `apps.update`

**Type:** Mutation

**Input Schema:**

```typescript
{
  id: number;               // Required: Positive integer
  htmlCode?: string;        // Optional: Updated HTML
  cssCode?: string;         // Optional: Updated CSS
  jsCode?: string;          // Optional: Updated JavaScript
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

**Error Handling:**

- Returns error if app ID is invalid

---

#### 4. Get All Apps

**Endpoint:** `apps.list`

**Type:** Query

**Input:** None

**Response:**

```typescript
Array<{
  id: number;
  sessionId: string;
  title: string;
  description: string | null;
  prompt: string;
  htmlCode: string;
  cssCode: string | null;
  jsCode: string | null;
  generatedAt: Date;
  updatedAt: Date;
}>;
```

**Pagination:** Supports limit (1-100, default 50) and offset parameters

**Example:**

```javascript
const apps = await trpc.apps.list.query();
```

---

#### 5. Get Single App

**Endpoint:** `apps.get`

**Type:** Query

**Input Schema:**

```typescript
{
  id: number; // Required: Positive integer
}
```

**Response:**

```typescript
{
  id: number;
  sessionId: string;
  title: string;
  description: string | null;
  prompt: string;
  htmlCode: string;
  cssCode: string | null;
  jsCode: string | null;
  generatedAt: Date;
  updatedAt: Date;
}
```

**Error Handling:**

- Returns error if app is not found

---

#### 6. Delete App

**Endpoint:** `apps.delete`

**Type:** Mutation

**Input Schema:**

```typescript
{
  id: number; // Required: Positive integer
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

---

## Error Handling

All errors are returned as tRPC errors with the following structure:

```typescript
{
  code: string; // Error code (e.g., "BAD_REQUEST", "NOT_FOUND")
  message: string; // Human-readable error message
}
```

### Common Error Codes

- `BAD_REQUEST`: Invalid input parameters
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error

---

## Rate Limiting

**Recommended Implementation:**

- 100 requests per minute per IP address
- 1000 requests per hour per IP address

---

## Best Practices

1. **Validate Input:** Always validate user input before sending to API
2. **Handle Errors:** Implement proper error handling in your client
3. **Use Sessions:** Maintain session IDs for better app management
4. **Pagination:** Use pagination for large datasets
5. **Caching:** Cache frequently accessed apps on the client side

---

## Environment Variables

Required for API functionality:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite://db.sqlite  # Optional
NODE_ENV=development
```

---

## Version History

- **v2.4.0** (Current): Added Zod validation, pagination support, improved error handling
- **v2.3.0**: Initial API release
