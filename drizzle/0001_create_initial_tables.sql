-- Migration: Create initial tables for UPND Membership System
-- This migration creates the core tables: members, disciplinary_cases, events, membership_cards, and NextAuth tables

-- Create members table
CREATE TABLE IF NOT EXISTS "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"membership_id" text UNIQUE NOT NULL,
	"full_name" text NOT NULL,
	"nrc_number" text UNIQUE NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" text DEFAULT 'Male',
	"phone" text NOT NULL,
	"email" text,
	"residential_address" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"province" text NOT NULL,
	"district" text NOT NULL,
	"constituency" text NOT NULL,
	"ward" text NOT NULL,
	"branch" text NOT NULL,
	"section" text NOT NULL,
	"education" text,
	"occupation" text,
	"skills" text[],
	"membership_level" text DEFAULT 'General',
	"party_role" text,
	"party_commitment" text,
	"status" text DEFAULT 'Pending Section Review',
	"profile_image" text,
	"notification_preferences" jsonb DEFAULT '{"sms": true, "email": true, "push": true}'::jsonb,
	"registration_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create disciplinary_cases table
CREATE TABLE IF NOT EXISTS "disciplinary_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"case_number" text UNIQUE NOT NULL,
	"member_id" uuid REFERENCES "members"("id") ON DELETE CASCADE,
	"violation_type" text NOT NULL,
	"description" text NOT NULL,
	"severity" text DEFAULT 'Medium',
	"status" text DEFAULT 'Active',
	"date_reported" date DEFAULT CURRENT_DATE,
	"date_incident" date,
	"reporting_officer" text NOT NULL,
	"assigned_officer" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_name" text NOT NULL,
	"event_type" text NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"event_time" time,
	"location" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"province" text,
	"district" text,
	"organizer" text NOT NULL,
	"expected_attendees" integer DEFAULT 0,
	"actual_attendees" integer DEFAULT 0,
	"status" text DEFAULT 'Planned',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create membership_cards table
CREATE TABLE IF NOT EXISTS "membership_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid REFERENCES "members"("id") ON DELETE CASCADE,
	"card_type" text DEFAULT 'Standard',
	"issue_date" date DEFAULT CURRENT_DATE,
	"expiry_date" date,
	"qr_code" text,
	"status" text DEFAULT 'Active',
	"renewal_reminder_sent" boolean DEFAULT false,
	"renewal_reminder_sent_at" timestamp with time zone,
	"last_renewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);

-- Create NextAuth users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text,
	"email" text UNIQUE NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" text DEFAULT 'Member',
	"jurisdiction" text,
	"level" text DEFAULT 'Section',
	"party_position" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create NextAuth accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	PRIMARY KEY("provider", "provider_account_id")
);

-- Create NextAuth sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_token" text PRIMARY KEY,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"expires" timestamp with time zone NOT NULL
);

-- Create NextAuth verification_tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	PRIMARY KEY("identifier", "token")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_members_province" ON "members"("province");
CREATE INDEX IF NOT EXISTS "idx_members_district" ON "members"("district");
CREATE INDEX IF NOT EXISTS "idx_members_constituency" ON "members"("constituency");
CREATE INDEX IF NOT EXISTS "idx_members_status" ON "members"("status");
CREATE INDEX IF NOT EXISTS "idx_members_geolocation" ON "members"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_members_membership_level" ON "members"("membership_level");
CREATE INDEX IF NOT EXISTS "idx_disciplinary_cases_member_id" ON "disciplinary_cases"("member_id");
CREATE INDEX IF NOT EXISTS "idx_disciplinary_cases_status" ON "disciplinary_cases"("status");
CREATE INDEX IF NOT EXISTS "idx_events_date" ON "events"("event_date");
CREATE INDEX IF NOT EXISTS "idx_events_province" ON "events"("province");
CREATE INDEX IF NOT EXISTS "idx_events_geolocation" ON "events"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_membership_cards_member_id" ON "membership_cards"("member_id");
CREATE INDEX IF NOT EXISTS "idx_membership_cards_expiry_date" ON "membership_cards"("expiry_date");
CREATE INDEX IF NOT EXISTS "idx_membership_cards_status" ON "membership_cards"("status");