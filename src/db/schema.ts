import { pgTable, uuid, text, date, numeric, integer, boolean, timestamp, jsonb, time, unique, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccount } from '@auth/core/adapters';

// NextAuth Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  password: text('password'),
  role: text('role').default('Member'),
  jurisdiction: text('jurisdiction'),
  level: text('level'),
  isActive: boolean('is_active').default(true),
  partyPosition: text('party_position'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').notNull().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Application Tables
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  membershipId: text('membership_id').unique().notNull(),
  fullName: text('full_name').notNull(),
  nrcNumber: text('nrc_number').unique().notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: text('gender').default('Male'),
  phone: text('phone').notNull(),
  email: text('email'),
  residentialAddress: text('residential_address').notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  province: text('province').notNull(),
  district: text('district').notNull(),
  constituency: text('constituency').notNull(),
  ward: text('ward').notNull(),
  branch: text('branch').notNull(),
  section: text('section').notNull(),
  education: text('education'),
  occupation: text('occupation'),
  skills: text('skills').array(),
  membershipLevel: text('membership_level').default('General'),
  partyRole: text('party_role'),
  partyCommitment: text('party_commitment'),
  status: text('status').default('Pending Section Review'),
  profileImage: text('profile_image'),
  notificationPreferences: jsonb('notification_preferences').default({ sms: true, email: true, push: true }),
  registrationDate: timestamp('registration_date', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const disciplinaryCases = pgTable('disciplinary_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: text('case_number').unique().notNull(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  violationType: text('violation_type').notNull(),
  description: text('description').notNull(),
  severity: text('severity').default('Medium'),
  status: text('status').default('Active'),
  dateReported: date('date_reported').default(sql`CURRENT_DATE`),
  dateIncident: date('date_incident'),
  reportingOfficer: text('reporting_officer').notNull(),
  assignedOfficer: text('assigned_officer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventName: text('event_name').notNull(),
  eventType: text('event_type').notNull(),
  description: text('description'),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time'),
  location: text('location').notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  province: text('province'),
  district: text('district'),
  organizer: text('organizer').notNull(),
  expectedAttendees: integer('expected_attendees').default(0),
  actualAttendees: integer('actual_attendees').default(0),
  status: text('status').default('Planned'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const membershipCards = pgTable('membership_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  cardType: text('card_type').default('Standard'),
  issueDate: date('issue_date').default(sql`CURRENT_DATE`),
  expiryDate: date('expiry_date'),
  qrCode: text('qr_code'),
  status: text('status').default('Active'),
  renewalReminderSent: boolean('renewal_reminder_sent').default(false),
  renewalReminderSentAt: timestamp('renewal_reminder_sent_at', { withTimezone: true }),
  lastRenewedAt: timestamp('last_renewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const eventRsvps = pgTable('event_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  response: text('response').default('Maybe'),
  respondedAt: timestamp('responded_at', { withTimezone: true }).defaultNow(),
  checkedIn: boolean('checked_in').default(false),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueEventMember: unique().on(table.eventId, table.memberId),
}));

export const communications = pgTable('communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  recipientFilter: jsonb('recipient_filter'),
  recipientsCount: integer('recipients_count').default(0),
  sentCount: integer('sent_count').default(0),
  failedCount: integer('failed_count').default(0),
  status: text('status').default('Draft'),
  sentBy: text('sent_by'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const communicationRecipients = pgTable('communication_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  communicationId: uuid('communication_id').references(() => communications.id, { onDelete: 'cascade' }).notNull(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('Pending'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type DisciplinaryCase = typeof disciplinaryCases.$inferSelect;
export type NewDisciplinaryCase = typeof disciplinaryCases.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type MembershipCard = typeof membershipCards.$inferSelect;
export type NewMembershipCard = typeof membershipCards.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type NewEventRsvp = typeof eventRsvps.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type NewCommunication = typeof communications.$inferInsert;
export type CommunicationRecipient = typeof communicationRecipients.$inferSelect;
export type NewCommunicationRecipient = typeof communicationRecipients.$inferInsert;
