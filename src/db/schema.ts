import { pgTable, uuid, text, date, numeric, integer, boolean, timestamp, jsonb, time, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type DisciplinaryCase = typeof disciplinaryCases.$inferSelect;
export type Event = typeof events.$inferSelect;
export type MembershipCard = typeof membershipCards.$inferSelect;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type Communication = typeof communications.$inferSelect;
export type CommunicationRecipient = typeof communicationRecipients.$inferSelect;
