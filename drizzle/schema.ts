import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Sessions table - simple session tracking without authentication
 * Used to associate generated apps with anonymous sessions
 */
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastActiveAt: integer("lastActiveAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Generated apps table - stores all apps created by sessions
 * Each app is generated from a natural language prompt using Groq API
 */
export const generatedApps = sqliteTable("generatedApps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  htmlCode: text("htmlCode").notNull(),
  cssCode: text("cssCode"),
  jsCode: text("jsCode"),
  generatedAt: integer("generatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type GeneratedApp = typeof generatedApps.$inferSelect;
export type InsertGeneratedApp = typeof generatedApps.$inferInsert;