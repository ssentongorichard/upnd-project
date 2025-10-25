-- Migration: Add additional constraints and indexes
-- This migration adds any missing constraints and optimizes queries

-- Add check constraints for better data integrity
ALTER TABLE "members" ADD CONSTRAINT "chk_members_gender" CHECK ("gender" IN ('Male', 'Female', 'Other'));
ALTER TABLE "members" ADD CONSTRAINT "chk_members_membership_level" CHECK ("membership_level" IN ('Youth Wing', 'Women''s Wing', 'Veterans', 'General'));
ALTER TABLE "members" ADD CONSTRAINT "chk_members_status" CHECK ("status" IN (
    'Pending Section Review',
    'Pending Branch Review',
    'Pending Ward Review',
    'Pending District Review',
    'Pending Provincial Review',
    'Approved',
    'Rejected',
    'Suspended',
    'Expelled'
));

ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "chk_disciplinary_severity" CHECK ("severity" IN ('Low', 'Medium', 'High'));
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "chk_disciplinary_status" CHECK ("status" IN ('Active', 'Under Review', 'Resolved', 'Appealed'));

ALTER TABLE "events" ADD CONSTRAINT "chk_events_status" CHECK ("status" IN ('Planned', 'Active', 'Completed', 'Cancelled'));

ALTER TABLE "membership_cards" ADD CONSTRAINT "chk_membership_cards_type" CHECK ("card_type" IN ('Standard', 'Premium', 'Executive'));
ALTER TABLE "membership_cards" ADD CONSTRAINT "chk_membership_cards_status" CHECK ("status" IN ('Active', 'Expired', 'Revoked'));

ALTER TABLE "event_rsvps" ADD CONSTRAINT "chk_event_rsvps_response" CHECK ("response" IN ('Yes', 'No', 'Maybe'));

ALTER TABLE "communications" ADD CONSTRAINT "chk_communications_type" CHECK ("type" IN ('SMS', 'Email', 'Push', 'WhatsApp'));
ALTER TABLE "communications" ADD CONSTRAINT "chk_communications_status" CHECK ("status" IN ('Draft', 'Scheduled', 'Sending', 'Sent', 'Failed'));

ALTER TABLE "communication_recipients" ADD CONSTRAINT "chk_communication_recipients_status" CHECK ("status" IN ('Pending', 'Sent', 'Failed', 'Delivered'));

-- Add additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_members_email" ON "members"("email");
CREATE INDEX IF NOT EXISTS "idx_members_phone" ON "members"("phone");
CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "members"("created_at");
CREATE INDEX IF NOT EXISTS "idx_members_registration_date" ON "members"("registration_date");

CREATE INDEX IF NOT EXISTS "idx_disciplinary_cases_date_reported" ON "disciplinary_cases"("date_reported");
CREATE INDEX IF NOT EXISTS "idx_disciplinary_cases_violation_type" ON "disciplinary_cases"("violation_type");

CREATE INDEX IF NOT EXISTS "idx_events_organizer" ON "events"("organizer");
CREATE INDEX IF NOT EXISTS "idx_events_created_at" ON "events"("created_at");

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users"("is_active");

-- Add partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS "idx_members_active" ON "members"("id") WHERE "status" = 'Approved';
CREATE INDEX IF NOT EXISTS "idx_members_pending" ON "members"("id") WHERE "status" LIKE 'Pending%';
CREATE INDEX IF NOT EXISTS "idx_events_upcoming" ON "events"("event_date") WHERE "event_date" >= CURRENT_DATE AND "status" = 'Planned';
CREATE INDEX IF NOT EXISTS "idx_membership_cards_active" ON "membership_cards"("id") WHERE "status" = 'Active';
CREATE INDEX IF NOT EXISTS "idx_membership_cards_expiring" ON "membership_cards"("expiry_date") WHERE "expiry_date" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' AND "status" = 'Active';