import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  generatedApps,
  InsertGeneratedApp,
  sessions,
  InsertSession,
} from "../drizzle/schema.js";

let _db: any = null;

type Database = any;

export async function getDb(): Promise<Database | null> {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.log("[Database] DATABASE_URL not configured, running without database");
    return null;
  }

  if (!_db) {
    try {
      // Create postgres connection
      const connectionString = process.env.DATABASE_URL;
      const client = postgres(connectionString, {
        prepare: false,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      _db = drizzle(client);
      console.log("[Database] Connected successfully to Supabase PostgreSQL");
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

  // Handle 'all' sessions case
  if (sessionId === 'all') {
    return db
      .select()
      .from(generatedApps)
      .orderBy(desc(generatedApps.generatedAt))
      .limit(validLimit)
      .offset(validOffset);
  }

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
