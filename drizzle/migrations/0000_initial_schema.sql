-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_active_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS "session_id_idx" ON "sessions" ("session_id");

-- Create generated_apps table
CREATE TABLE IF NOT EXISTS "generated_apps" (
  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "prompt" TEXT NOT NULL,
  "html_code" TEXT NOT NULL,
  "css_code" TEXT,
  "js_code" TEXT,
  "generated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "generated_apps_session_id_idx" ON "generated_apps" ("session_id");
CREATE INDEX IF NOT EXISTS "generated_apps_generated_at_idx" ON "generated_apps" ("generated_at");

-- Add foreign key constraint (optional, for data integrity)
-- ALTER TABLE "generated_apps" ADD CONSTRAINT "generated_apps_session_id_fkey" 
-- FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE;
