# Deployment Guide for Vercel

This guide covers the steps to deploy the No-Code AI App Builder on Vercel.

## 1. Prerequisites

- A Vercel account
- A Groq API Key
- (Optional) A PostgreSQL database connection string

## 2. Deployment Steps

### Using Vercel Dashboard (Recommended)

1.  **Import Project**: Connect your GitHub repository to Vercel.
2.  **Framework Preset**: Select "Other" or leave as default (the project uses a custom `vercel.json`).
3.  **Environment Variables**: Add the following in the Vercel dashboard:
    -   `GROQ_API_KEY`: Your API key from Groq Console.
    -   `DATABASE_URL`: (Optional) Your PostgreSQL connection string.
    -   `NODE_ENV`: Set to `production`.
4.  **Build Settings**: The build command is automatically detected from `package.json` (`npm run build`).
5.  **Deploy**: Click "Deploy".

### Using Vercel CLI

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root and follow the prompts.
3.  Add environment variables when prompted or via the Vercel dashboard.
4.  Deploy to production: `vercel --prod`

## 3. Critical Configuration

-   **Function Timeout**: The `api/trpc.ts` function is configured with a `maxDuration` of 60 seconds in `vercel.json` to allow enough time for Groq API responses.
-   **Build Process**: The build script (`npm run build`) automatically runs type-checks before building the frontend assets.

## 4. Troubleshooting

-   **Timeout Errors**: If you encounter 504 Gateway Timeout errors, ensure `maxDuration` is correctly set in `vercel.json` and your Vercel plan supports the configured duration.
-   **Database Connection**: If the `DATABASE_URL` is missing or invalid, the app will gracefully fall back to "Demo Mode" (no persistence).
-   **Build Failures**: Check the Vercel build logs. Ensure all dependencies are correctly listed in `package.json`.
