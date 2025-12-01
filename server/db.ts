import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { generatedApps, InsertGeneratedApp, sessions, InsertSession } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
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
    throw new Error("Database not available");
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
    throw new Error("Database not available");
  }
  const result = await db.insert(generatedApps).values(app);
  return result;
}

export async function getAllGeneratedApps() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.select().from(generatedApps).orderBy(desc(generatedApps.generatedAt));
}

export async function getGeneratedAppsBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.select().from(generatedApps).where(eq(generatedApps.sessionId, sessionId)).orderBy(desc(generatedApps.generatedAt));
}

export async function getGeneratedAppById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(generatedApps).where(eq(generatedApps.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGeneratedApp(id: number, updates: Partial<InsertGeneratedApp>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.update(generatedApps).set({ ...updates, updatedAt: new Date() }).where(eq(generatedApps.id, id));
}

export async function deleteGeneratedApp(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.delete(generatedApps).where(eq(generatedApps.id, id));
}
