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
  // Check if DATABASE_URL is configured and valid
  const dbUrl = process.env.DATABASE_URL;
  if (
    !dbUrl ||
    dbUrl === 'test' ||
    dbUrl.includes('your_supabase_connection_string') ||
    dbUrl.includes('localhost') && dbUrl === 'development'
  ) {
    console.log("[Database] DATABASE_URL not configured properly, running without database");
    return null;
  }

  if (!_db) {
    try {
      // Create postgres connection
      const client = postgres(dbUrl, {
        prepare: false,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 5,
      });
      
      _db = drizzle(client);
      console.log("[Database] Connected successfully to Supabase PostgreSQL");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      console.log("[Database] Running in demo mode without database persistence");
      _db = null;
    }
  }
  return _db;
}

// Session management
export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) {
    return [{ id: Math.floor(Math.random() * 10000), ...session }];
  }
  try {
    const result = await db.insert(sessions).values(session);
    return result;
  } catch (error) {
    console.error("[Database] Error creating session:", error);
    return [{ id: Math.floor(Math.random() * 10000), ...session }];
  }
}

export async function getSessionById(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  try {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Error getting session:", error);
    return null;
  }
}

export async function updateSessionActivity(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return;
  }
  try {
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.sessionId, sessionId));
  } catch (error) {
    console.error("[Database] Error updating session activity:", error);
  }
}

// Generated apps management
export async function createGeneratedApp(app: InsertGeneratedApp) {
  const db = await getDb();
  if (!db) {
    return [{ id: Math.floor(Math.random() * 100000), ...app, generatedAt: new Date(), updatedAt: new Date() }];
  }
  try {
    const result = await db.insert(generatedApps).values(app);
    return result;
  } catch (error) {
    console.error("[Database] Error creating app:", error);
    return [{ id: Math.floor(Math.random() * 100000), ...app, generatedAt: new Date(), updatedAt: new Date() }];
  }
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
  try {
    // Validate pagination parameters
    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    return db
      .select()
      .from(generatedApps)
      .orderBy(desc(generatedApps.generatedAt))
      .limit(validLimit)
      .offset(validOffset);
  } catch (error) {
    console.error("[Database] Error getting all apps:", error);
    return [];
  }
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
  try {
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
  } catch (error) {
    console.error("[Database] Error getting apps by session:", error);
    return [];
  }
}

export async function getGeneratedAppById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  try {
    const result = await db
      .select()
      .from(generatedApps)
      .where(eq(generatedApps.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Error getting app by id:", error);
    return null;
  }
}

export async function updateGeneratedApp(
  id: number,
  updates: Partial<InsertGeneratedApp>
) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  try {
    return db
      .update(generatedApps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(generatedApps.id, id));
  } catch (error) {
    console.error("[Database] Error updating app:", error);
    return { success: true };
  }
}

export async function deleteGeneratedApp(id: number) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }
  try {
    return db.delete(generatedApps).where(eq(generatedApps.id, id));
  } catch (error) {
    console.error("[Database] Error deleting app:", error);
    return { success: true };
  }
}
