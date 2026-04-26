import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema.js";
import { generatedApps, type InsertGeneratedApp, sessions, type InsertSession } from "../drizzle/schema.js";
import { logger } from "./utils/logging.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

const PLACEHOLDER_URLS = ["your_supabase_connection_string", "your_database_url_here"];

export async function getDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl === "test" || PLACEHOLDER_URLS.some(p => dbUrl.includes(p))) {
    logger.info("Database", "DATABASE_URL not configured, running without database");
    return null;
  }

  if (!_db) {
    try {
      const client = postgres(dbUrl, {
        prepare: false,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 5,
      });

      _db = drizzle(client, { schema });
      logger.info("Database", "Connected successfully to PostgreSQL");
    } catch (error) {
      logger.error("Database", "Failed to connect", error instanceof Error ? error : new Error(String(error)));
      logger.info("Database", "Running in demo mode without database persistence");
      _db = null;
    }
  }

  return _db;
}

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) {
    return [{ id: Math.floor(Math.random() * 10000), ...session }];
  }

  try {
    return await db.insert(sessions).values(session).returning();
  } catch (error) {
    logger.error("Database", "Error creating session", error instanceof Error ? error : new Error(String(error)));
    return [{ id: Math.floor(Math.random() * 10000), ...session }];
  }
}

export async function getSessionById(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error("Database", "Error getting session", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

export async function createGeneratedApp(app: InsertGeneratedApp) {
  const db = await getDb();
  if (!db) {
    return [{ id: Math.floor(Math.random() * 100000), ...app, generatedAt: new Date(), updatedAt: new Date() }];
  }

  try {
    return await db.insert(generatedApps).values(app).returning();
  } catch (error) {
    logger.error("Database", "Error creating app", error instanceof Error ? error : new Error(String(error)));
    return [{ id: Math.floor(Math.random() * 100000), ...app, generatedAt: new Date(), updatedAt: new Date() }];
  }
}

export async function getGeneratedAppsBySessionId(sessionId: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    if (sessionId === "all") {
      return await db
        .select()
        .from(generatedApps)
        .orderBy(desc(generatedApps.generatedAt))
        .limit(validLimit)
        .offset(validOffset);
    }

    return await db
      .select()
      .from(generatedApps)
      .where(eq(generatedApps.sessionId, sessionId))
      .orderBy(desc(generatedApps.generatedAt))
      .limit(validLimit)
      .offset(validOffset);
  } catch (error) {
    logger.error("Database", "Error getting apps by session", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

export async function getGeneratedAppById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(generatedApps).where(eq(generatedApps.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error("Database", "Error getting app by id", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

export async function updateGeneratedApp(id: number, updates: Partial<InsertGeneratedApp>) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }

  try {
    return await db
      .update(generatedApps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(generatedApps.id, id))
      .returning();
  } catch (error) {
    logger.error("Database", "Error updating app", error instanceof Error ? error : new Error(String(error)));
    return { success: true };
  }
}

export async function deleteGeneratedApp(id: number) {
  const db = await getDb();
  if (!db) {
    return { success: true };
  }

  try {
    return await db.delete(generatedApps).where(eq(generatedApps.id, id));
  } catch (error) {
    logger.error("Database", "Error deleting app", error instanceof Error ? error : new Error(String(error)));
    return { success: true };
  }
}
