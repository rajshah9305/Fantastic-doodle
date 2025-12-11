import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Sessions table - simple session tracking without authentication
 * Used to associate generated apps with anonymous sessions
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  lastActiveAt: timestamp("last_active_at", { mode: "date" })
    .notNull()
    .defaultNow(),
}, (table) => ({
  sessionIdIdx: index("session_id_idx").on(table.sessionId),
}));

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Generated apps table - stores all apps created by sessions
 * Each app is generated from a natural language prompt using Groq API
 */
export const generatedApps = pgTable("generated_apps", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code"),
  jsCode: text("js_code"),
  generatedAt: timestamp("generated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
}, (table) => ({
  sessionIdIdx: index("generated_apps_session_id_idx").on(table.sessionId),
  generatedAtIdx: index("generated_apps_generated_at_idx").on(table.generatedAt),
}));

export type GeneratedApp = typeof generatedApps.$inferSelect;
export type InsertGeneratedApp = typeof generatedApps.$inferInsert;
