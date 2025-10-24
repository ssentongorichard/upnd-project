import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create NextAuth tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified TIMESTAMPTZ,
        image TEXT,
        role TEXT DEFAULT 'Member',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at TIMESTAMPTZ,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token TEXT NOT NULL UNIQUE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL
      );
    `);

    // Create main application tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        membership_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        nrc_number TEXT UNIQUE NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT DEFAULT 'Male',
        phone TEXT NOT NULL,
        email TEXT,
        residential_address TEXT NOT NULL,
        latitude NUMERIC(10, 8),
        longitude NUMERIC(11, 8),
        province TEXT NOT NULL,
        district TEXT NOT NULL,
        constituency TEXT NOT NULL,
        ward TEXT NOT NULL,
        branch TEXT NOT NULL,
        section TEXT NOT NULL,
        education TEXT,
        occupation TEXT,
        skills TEXT[],
        membership_level TEXT DEFAULT 'General',
        party_role TEXT,
        party_commitment TEXT,
        status TEXT DEFAULT 'Pending Section Review',
        profile_image TEXT,
        notification_preferences JSONB DEFAULT '{"sms": true, "email": true, "push": true}',
        registration_date TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS disciplinary_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_number TEXT UNIQUE NOT NULL,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        violation_type TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Active',
        date_reported DATE DEFAULT CURRENT_DATE,
        date_incident DATE,
        reporting_officer TEXT NOT NULL,
        assigned_officer TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        location TEXT NOT NULL,
        latitude NUMERIC(10, 8),
        longitude NUMERIC(11, 8),
        province TEXT,
        district TEXT,
        organizer TEXT NOT NULL,
        expected_attendees INTEGER DEFAULT 0,
        actual_attendees INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Planned',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS membership_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        card_type TEXT DEFAULT 'Standard',
        issue_date DATE DEFAULT CURRENT_DATE,
        expiry_date DATE,
        qr_code TEXT,
        status TEXT DEFAULT 'Active',
        renewal_reminder_sent BOOLEAN DEFAULT FALSE,
        renewal_reminder_sent_at TIMESTAMPTZ,
        last_renewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
        response TEXT DEFAULT 'Maybe',
        responded_at TIMESTAMPTZ DEFAULT NOW(),
        checked_in BOOLEAN DEFAULT FALSE,
        checked_in_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, member_id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        recipient_filter JSONB,
        recipients_count INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        sent_by TEXT,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS communication_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        communication_id UUID REFERENCES communications(id) ON DELETE CASCADE NOT NULL,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
        status TEXT DEFAULT 'Pending',
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_members_province ON members(province);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_members_district ON members(district);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_members_membership_level ON members(membership_level);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_disciplinary_cases_status ON disciplinary_cases(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_disciplinary_cases_member_id ON disciplinary_cases(member_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_membership_cards_status ON membership_cards(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_membership_cards_member_id ON membership_cards(member_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_communication_recipients_communication_id ON communication_recipients(communication_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_communication_recipients_member_id ON communication_recipients(member_id);`);

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();