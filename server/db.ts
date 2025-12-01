import { desc, eq } from "drizzle-orm";
import { generatedApps, InsertGeneratedApp, sessions, InsertSession } from "../drizzle/schema";

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
      
      const dbPath = process.env.DATABASE_URL.replace('sqlite://', '').replace('file:', '');
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
  const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSessionActivity(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return;
  }
  await db.update(sessions).set({ lastActiveAt: new Date() }).where(eq(sessions.sessionId, sessionId));
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

export async function getAllGeneratedApps() {
  const db = await getDb();
  if (!db) {
    // Return empty array if no database
    return [];
  }
  return db.select().from(generatedApps).orderBy(desc(generatedApps.generatedAt));
}

export async function getGeneratedAppsBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) {
    // Return empty array if no database
    return [];
  }
  return db.select().from(generatedApps).where(eq(generatedApps.sessionId, sessionId)).orderBy(desc(generatedApps.generatedAt));
}

export async function getGeneratedAppById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const result = await db.select().from(generatedApps).where(eq(generatedApps.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGeneratedApp(id: number, updates: Partial<InsertGeneratedApp>) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  return db.update(generatedApps).set({ ...updates, updatedAt: new Date() }).where(eq(generatedApps.id, id));
}

export async function deleteGeneratedApp(id: number) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  return db.delete(generatedApps).where(eq(generatedApps.id, id));
}
