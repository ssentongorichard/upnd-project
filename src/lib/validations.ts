import { z } from 'zod';

// Member validation schemas
export const memberSchema = z.object({
  id: z.string().uuid().optional(),
  membershipId: z.string().min(1, 'Membership ID is required'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  nrcNumber: z.string().min(1, 'NRC number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']).optional().default('Male'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  residentialAddress: z.string().min(5, 'Residential address is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  constituency: z.string().min(1, 'Constituency is required'),
  ward: z.string().min(1, 'Ward is required'),
  branch: z.string().min(1, 'Branch is required'),
  section: z.string().min(1, 'Section is required'),
  education: z.string().optional(),
  occupation: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  membershipLevel: z.enum(['Youth Wing', 'Women\'s Wing', 'Veterans', 'General']).default('General'),
  partyRole: z.string().optional(),
  partyCommitment: z.string().optional(),
  status: z.enum([
    'Pending Section Review',
    'Pending Branch Review',
    'Pending Ward Review',
    'Pending District Review',
    'Pending Provincial Review',
    'Approved',
    'Rejected',
    'Suspended',
    'Expelled'
  ]).default('Pending Section Review'),
  profileImage: z.string().optional(),
  notificationPreferences: z.object({
    sms: z.boolean().default(true),
    email: z.boolean().default(true),
    push: z.boolean().default(true)
  }).optional().default({ sms: true, email: true, push: true })
});

export const newMemberSchema = memberSchema.omit({ id: true });

// Disciplinary case validation schemas
export const disciplinaryCaseSchema = z.object({
  id: z.string().uuid().optional(),
  caseNumber: z.string().min(1, 'Case number is required'),
  memberId: z.string().uuid('Invalid member ID'),
  violationType: z.string().min(1, 'Violation type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['Active', 'Under Review', 'Resolved', 'Appealed']).default('Active'),
  dateReported: z.string().optional(),
  dateIncident: z.string().optional(),
  reportingOfficer: z.string().min(1, 'Reporting officer is required'),
  assignedOfficer: z.string().optional()
});

export const newDisciplinaryCaseSchema = disciplinaryCaseSchema.omit({ id: true });

// Event validation schemas
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  eventName: z.string().min(1, 'Event name is required'),
  eventType: z.string().min(1, 'Event type is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  organizer: z.string().min(1, 'Organizer is required'),
  expectedAttendees: z.number().int().min(0).default(0),
  actualAttendees: z.number().int().min(0).default(0),
  status: z.enum(['Planned', 'Active', 'Completed', 'Cancelled']).default('Planned')
});

export const newEventSchema = eventSchema.omit({ id: true });

// Event RSVP validation schemas
export const eventRsvpSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid('Invalid event ID'),
  memberId: z.string().uuid('Invalid member ID'),
  response: z.enum(['Yes', 'No', 'Maybe']).default('Maybe'),
  checkedIn: z.boolean().default(false),
  notes: z.string().optional()
});

export const newEventRsvpSchema = eventRsvpSchema.omit({ id: true });

// Communication validation schemas
export const communicationSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['SMS', 'Email', 'Push', 'WhatsApp']),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  recipientFilter: z.object({
    provinces: z.array(z.string()).optional(),
    districts: z.array(z.string()).optional(),
    constituencies: z.array(z.string()).optional(),
    wards: z.array(z.string()).optional(),
    branches: z.array(z.string()).optional(),
    sections: z.array(z.string()).optional(),
    membershipLevels: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional()
  }).optional(),
  status: z.enum(['Draft', 'Scheduled', 'Sending', 'Sent', 'Failed']).default('Draft'),
  sentBy: z.string().optional()
});

export const newCommunicationSchema = communicationSchema.omit({ id: true });

// Membership card validation schemas
export const membershipCardSchema = z.object({
  id: z.string().uuid().optional(),
  memberId: z.string().uuid('Invalid member ID'),
  cardType: z.enum(['Standard', 'Premium', 'Executive']).default('Standard'),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  qrCode: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Revoked']).default('Active')
});

export const newMembershipCardSchema = membershipCardSchema.omit({ id: true });

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum([
    'National Admin',
    'Provincial Admin',
    'District Admin',
    'Constituency Admin',
    'Ward Admin',
    'Branch Admin',
    'Section Admin',
    'Member'
  ]),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  level: z.enum([
    'National',
    'Provincial',
    'District',
    'Constituency',
    'Ward',
    'Branch',
    'Section'
  ]),
  partyPosition: z.string().optional()
});

// Query parameter schemas
export const memberQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  membershipLevel: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const eventQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  eventType: z.string().optional(),
  status: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional().default('eventDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const disciplinaryQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  violationType: z.string().optional(),
  sortBy: z.string().optional().default('dateReported'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Type exports
export type MemberFormData = z.infer<typeof memberSchema>;
export type NewMemberFormData = z.infer<typeof newMemberSchema>;
export type DisciplinaryCaseFormData = z.infer<typeof disciplinaryCaseSchema>;
export type NewDisciplinaryCaseFormData = z.infer<typeof newDisciplinaryCaseSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type NewEventFormData = z.infer<typeof newEventSchema>;
export type EventRsvpFormData = z.infer<typeof eventRsvpSchema>;
export type NewEventRsvpFormData = z.infer<typeof newEventRsvpSchema>;
export type CommunicationFormData = z.infer<typeof communicationSchema>;
export type NewCommunicationFormData = z.infer<typeof newCommunicationSchema>;
export type MembershipCardFormData = z.infer<typeof membershipCardSchema>;
export type NewMembershipCardFormData = z.infer<typeof newMembershipCardSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type MemberQueryParams = z.infer<typeof memberQuerySchema>;
export type EventQueryParams = z.infer<typeof eventQuerySchema>;
export type DisciplinaryQueryParams = z.infer<typeof disciplinaryQuerySchema>;