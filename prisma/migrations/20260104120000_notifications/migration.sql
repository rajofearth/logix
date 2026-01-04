-- Create enum for notification type
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('job', 'driver', 'packageVerification', 'billing', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create notification events (shared payload)
CREATE TABLE IF NOT EXISTS "notification_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "action_url" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notification_events_created_at_idx" ON "notification_events" ("created_at");
CREATE INDEX IF NOT EXISTS "notification_events_type_idx" ON "notification_events" ("type");

-- Per-admin receipt/state
CREATE TABLE IF NOT EXISTS "notification_receipts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "event_id" UUID NOT NULL,
  "read_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_receipts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notification_receipts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "notification_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_receipts_user_id_event_id_key" ON "notification_receipts" ("user_id", "event_id");
CREATE INDEX IF NOT EXISTS "notification_receipts_user_id_created_at_idx" ON "notification_receipts" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "notification_receipts_user_id_read_at_idx" ON "notification_receipts" ("user_id", "read_at");
CREATE INDEX IF NOT EXISTS "notification_receipts_user_id_archived_at_idx" ON "notification_receipts" ("user_id", "archived_at");


