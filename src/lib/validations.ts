import { z } from 'zod';

// Member validation schemas
export const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  nrcNumber: z.string().min(10, 'NRC number must be at least 10 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional(),
  residentialAddress: z.string().min(5, 'Residential address must be at least 5 characters'),
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
  skills: z.array(z.string()).optional(),
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
});

export const memberUpdateSchema = memberSchema.partial();

// Event validation schemas
export const eventSchema = z.object({
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
  expectedAttendees: z.number().min(0).optional(),
  status: z.enum(['Planned', 'Active', 'Completed', 'Cancelled']).default('Planned'),
});

export const eventUpdateSchema = eventSchema.partial();

// Disciplinary case validation schemas
export const disciplinaryCaseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  memberId: z.string().uuid('Invalid member ID'),
  violationType: z.string().min(1, 'Violation type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['Active', 'Under Review', 'Resolved', 'Appealed']).default('Active'),
  dateIncident: z.string().optional(),
  reportingOfficer: z.string().min(1, 'Reporting officer is required'),
  assignedOfficer: z.string().optional(),
});

export const disciplinaryCaseUpdateSchema = disciplinaryCaseSchema.partial();

// Communication validation schemas
export const communicationSchema = z.object({
  type: z.enum(['SMS', 'Email', 'Push Notification', 'WhatsApp']),
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
    statuses: z.array(z.string()).optional(),
  }).optional(),
});

export const communicationUpdateSchema = communicationSchema.partial();

// Membership card validation schemas
export const membershipCardSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  cardType: z.enum(['Standard', 'Premium', 'Executive']).default('Standard'),
  expiryDate: z.string().optional(),
});

export const membershipCardUpdateSchema = membershipCardSchema.partial();

// Event RSVP validation schemas
export const eventRsvpSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  memberId: z.string().uuid('Invalid member ID'),
  response: z.enum(['Yes', 'No', 'Maybe']).default('Maybe'),
  notes: z.string().optional(),
});

export const eventRsvpUpdateSchema = eventRsvpSchema.partial();

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});