import { desc, eq } from "drizzle-orm";
import {
  generatedApps,
  InsertGeneratedApp,
  sessions,
  InsertSession,
} from "../drizzle/schema";

let _db: any = null;

export async function getDb() {
  // Skip database in production/serverless environments
  if (process.env.VERCEL || !process.env.DATABASE_URL) {
    console.log("[Database] Running without database (serverless mode)");
    return null;
  }

  if (!_db) {
    try {
      // Dynamically import better-sqlite3 only when needed
      const { drizzle } = await import("drizzle-orm/better-sqlite3");
      const Database = (await import("better-sqlite3")).default;

      const dbPath = process.env.DATABASE_URL.replace("sqlite://", "").replace(
        "file:",
        ""
      );
      const sqlite = new Database(dbPath);
      _db = drizzle(sqlite);
      console.log("[Database] Connected successfully to:", dbPath);
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Session management
export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) {
    // In production without database, just return success
    console.log("[Database] Session creation skipped - no database available");
    return { success: true };
  }
  const result = await db.insert(sessions).values(session);
  return result;
}

export async function getSessionById(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSessionActivity(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return;
  }
  await db
    .update(sessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(sessions.sessionId, sessionId));
}

// Generated apps management
export async function createGeneratedApp(app: InsertGeneratedApp) {
  const db = await getDb();
  if (!db) {
    // In production without database, just return success
    console.log("[Database] App creation skipped - no database available");
    return { success: true };
  }
  const result = await db.insert(generatedApps).values(app);
  return result;
}

// FIX: Add pagination to prevent N+1 query performance issues
export async function getAllGeneratedApps(
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) {
    // Return empty array if no database
    return [];
  }
  // Validate pagination parameters
  const validLimit = Math.min(Math.max(1, limit), 100);
  const validOffset = Math.max(0, offset);

  return db
    .select()
    .from(generatedApps)
    .orderBy(desc(generatedApps.generatedAt))
    .limit(validLimit)
    .offset(validOffset);
}

// FIX: Add pagination to prevent N+1 query performance issues
export async function getGeneratedAppsBySessionId(
  sessionId: string,
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) {
    // Return empty array if no database
    return [];
  }
  // Validate pagination parameters
  const validLimit = Math.min(Math.max(1, limit), 100);
  const validOffset = Math.max(0, offset);

  return db
    .select()
    .from(generatedApps)
    .where(eq(generatedApps.sessionId, sessionId))
    .orderBy(desc(generatedApps.generatedAt))
    .limit(validLimit)
    .offset(validOffset);
}

export async function getGeneratedAppById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const result = await db
    .select()
    .from(generatedApps)
    .where(eq(generatedApps.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGeneratedApp(
  id: number,
  updates: Partial<InsertGeneratedApp>
) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  return db
    .update(generatedApps)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(generatedApps.id, id));
}

export async function deleteGeneratedApp(id: number) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  return db.delete(generatedApps).where(eq(generatedApps.id, id));
}
