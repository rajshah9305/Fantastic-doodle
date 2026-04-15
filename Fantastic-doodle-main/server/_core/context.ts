import type { inferAsyncReturnType } from '@trpc/server';
import type { NodeHTTPRequest, NodeHTTPResponse } from '@trpc/server/adapters/node-http';

// ✅ SIMPLE CONTEXT - no merging conflicts
export async function createContext(opts: { req: NodeHTTPRequest; res: NodeHTTPResponse }) {
  return {
    req: opts.req,
    res: opts.res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
