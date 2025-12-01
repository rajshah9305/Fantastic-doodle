// This file is kept for compatibility but the main API is now at /api/trpc/[trpc].ts
// Redirect to documentation or health check
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    message: 'AI Studio API is running',
    version: '1.0.0',
    endpoints: {
      trpc: '/api/trpc',
    },
  });
}
