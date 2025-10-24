import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional().default('Member'),
});

// Member Validation Schemas
export const memberRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nrcNumber: z.string().regex(/^\d{6}\/\d{2}\/\d$/, 'Invalid NRC format. Should be XXXXXX/XX/X'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
  gender: z.enum(['Male', 'Female', 'Other']).optional().default('Male'),
  phone: z.string().regex(/^\+260[0-9]{9}$|^[0-9]{10}$/, 'Invalid Zambian phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  residentialAddress: z.string().min(5, 'Residential address is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  province: z.string().min(2, 'Province is required'),
  district: z.string().min(2, 'District is required'),
  constituency: z.string().min(2, 'Constituency is required'),
  ward: z.string().min(2, 'Ward is required'),
  branch: z.string().min(2, 'Branch is required'),
  section: z.string().min(2, 'Section is required'),
  education: z.string().optional(),
  occupation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  membershipLevel: z.string().optional().default('General'),
  partyRole: z.string().optional(),
  partyCommitment: z.string().optional(),
  profileImage: z.string().optional(),
});

export const memberUpdateSchema = memberRegistrationSchema.partial();

export const memberStatusUpdateSchema = z.object({
  id: z.string().uuid(),
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
  ]),
});

// Event Validation Schemas
export const eventSchema = z.object({
  eventName: z.string().min(3, 'Event name must be at least 3 characters'),
  eventType: z.string().min(2, 'Event type is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  organizer: z.string().min(2, 'Organizer name is required'),
  expectedAttendees: z.number().int().min(0).optional().default(0),
  actualAttendees: z.number().int().min(0).optional().default(0),
  status: z.enum(['Planned', 'Ongoing', 'Completed', 'Cancelled']).optional().default('Planned'),
});

export const eventUpdateSchema = eventSchema.partial();

export const eventRsvpSchema = z.object({
  eventId: z.string().uuid(),
  memberId: z.string().uuid(),
  response: z.enum(['Going', 'Maybe', 'Not Going']).default('Maybe'),
  notes: z.string().optional(),
});

// Disciplinary Case Validation Schemas
export const disciplinaryCaseSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  violationType: z.string().min(3, 'Violation type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  dateIncident: z.string().optional(),
  reportingOfficer: z.string().min(2, 'Reporting officer name is required'),
  assignedOfficer: z.string().optional(),
  status: z.enum(['Active', 'Under Investigation', 'Resolved', 'Closed', 'Appealed']).optional().default('Active'),
});

export const disciplinaryCaseUpdateSchema = disciplinaryCaseSchema.partial();

// Communication Validation Schemas
export const communicationSchema = z.object({
  type: z.enum(['SMS', 'Email', 'Push Notification', 'Announcement']),
  subject: z.string().min(3, 'Subject is required').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  recipientFilter: z.object({
    province: z.string().optional(),
    district: z.string().optional(),
    constituency: z.string().optional(),
    ward: z.string().optional(),
    branch: z.string().optional(),
    section: z.string().optional(),
    status: z.string().optional(),
    membershipLevel: z.string().optional(),
  }).optional(),
  sentBy: z.string().optional(),
  status: z.enum(['Draft', 'Scheduled', 'Sending', 'Sent', 'Failed']).optional().default('Draft'),
});

export const communicationUpdateSchema = communicationSchema.partial();

// Membership Card Validation Schemas
export const membershipCardSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  cardType: z.enum(['Standard', 'Gold', 'Platinum']).default('Standard'),
  expiryDate: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Suspended', 'Revoked']).default('Active'),
});

export const membershipCardUpdateSchema = membershipCardSchema.partial();

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type MemberStatusUpdateInput = z.infer<typeof memberStatusUpdateSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventRsvpInput = z.infer<typeof eventRsvpSchema>;
export type DisciplinaryCaseInput = z.infer<typeof disciplinaryCaseSchema>;
export type DisciplinaryCaseUpdateInput = z.infer<typeof disciplinaryCaseUpdateSchema>;
export type CommunicationInput = z.infer<typeof communicationSchema>;
export type CommunicationUpdateInput = z.infer<typeof communicationUpdateSchema>;
export type MembershipCardInput = z.infer<typeof membershipCardSchema>;
export type MembershipCardUpdateInput = z.infer<typeof membershipCardUpdateSchema>;
