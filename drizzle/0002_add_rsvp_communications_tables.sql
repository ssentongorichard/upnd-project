-- Migration: Add RSVP and Communications tables
-- This migration adds event_rsvps, communications, and communication_recipients tables

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS "event_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
	"member_id" uuid NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
	"response" text DEFAULT 'Maybe',
	"responded_at" timestamp with time zone DEFAULT now(),
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	UNIQUE("event_id", "member_id")
);

-- Create communications table
CREATE TABLE IF NOT EXISTS "communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"recipient_filter" jsonb,
	"recipients_count" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"sent_by" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create communication_recipients table
CREATE TABLE IF NOT EXISTS "communication_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"communication_id" uuid NOT NULL REFERENCES "communications"("id") ON DELETE CASCADE,
	"member_id" uuid NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
	"status" text DEFAULT 'Pending',
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS "idx_event_rsvps_event_id" ON "event_rsvps"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_rsvps_member_id" ON "event_rsvps"("member_id");
CREATE INDEX IF NOT EXISTS "idx_event_rsvps_response" ON "event_rsvps"("response");
CREATE INDEX IF NOT EXISTS "idx_event_rsvps_checked_in" ON "event_rsvps"("checked_in");

CREATE INDEX IF NOT EXISTS "idx_communications_status" ON "communications"("status");
CREATE INDEX IF NOT EXISTS "idx_communications_type" ON "communications"("type");
CREATE INDEX IF NOT EXISTS "idx_communications_sent_at" ON "communications"("sent_at");

CREATE INDEX IF NOT EXISTS "idx_communication_recipients_communication_id" ON "communication_recipients"("communication_id");
CREATE INDEX IF NOT EXISTS "idx_communication_recipients_member_id" ON "communication_recipients"("member_id");
CREATE INDEX IF NOT EXISTS "idx_communication_recipients_status" ON "communication_recipients"("status");