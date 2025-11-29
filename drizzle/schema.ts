import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role").default("user").notNull(),
  /** Stripe customer ID for payment processing */
  stripeCustomerId: text("stripeCustomerId"),
  /** Current subscription tier: free, basic, pro, enterprise */
  subscriptionTier: text("subscriptionTier").default("free").notNull(),
  /** Stripe subscription ID for active subscription */
  stripeSubscriptionId: text("stripeSubscriptionId"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generated apps table - stores all apps created by users
 * Each app is generated from a natural language prompt using Groq API
 */
export const generatedApps = sqliteTable("generatedApps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
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

/**
 * Subscription table - tracks user subscriptions and billing information
 * Only stores essential Stripe identifiers, not duplicate payment data
 */
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  /** Stripe subscription ID */
  stripeSubscriptionId: text("stripeSubscriptionId").notNull().unique(),
  /** Stripe customer ID */
  stripeCustomerId: text("stripeCustomerId").notNull(),
  /** Subscription tier */
  tier: text("tier").notNull(),
  /** Subscription status: active, past_due, canceled, unpaid */
  status: text("status").notNull(),
  /** When the subscription started */
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  /** When the subscription will renew */
  renewalDate: integer("renewalDate", { mode: "timestamp" }),
  /** When the subscription was canceled (if applicable) */
  canceledAt: integer("canceledAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payments table - tracks individual payment transactions
 * Stores only essential Stripe identifiers for audit and reference
 */
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  /** Stripe payment intent ID */
  stripePaymentIntentId: text("stripePaymentIntentId").notNull().unique(),
  /** Stripe invoice ID (if from subscription) */
  stripeInvoiceId: text("stripeInvoiceId"),
  /** Payment amount in cents */
  amount: integer("amount").notNull(),
  /** Currency code (e.g., 'usd') */
  currency: text("currency").default("usd").notNull(),
  /** Payment status: succeeded, pending, failed */
  status: text("status").notNull(),
  /** Subscription tier purchased */
  tier: text("tier").notNull(),
  /** Payment method type (card, bank_account, etc.) */
  paymentMethod: text("paymentMethod"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;