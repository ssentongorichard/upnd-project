import { z } from 'zod';

export const MemberCreateSchema = z.object({
  fullName: z.string().min(1),
  nrcNumber: z.string().regex(/^\d{6}\/\d{2}\/\d$/, 'Invalid NRC format'),
  dateOfBirth: z.string().min(1),
  residentialAddress: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  jurisdiction: z.object({
    province: z.string().min(1),
    district: z.string().min(1),
    constituency: z.string().min(1),
    ward: z.string().min(1),
    branch: z.string().min(1),
    section: z.string().min(1)
  }),
});

export const MemberUpdateSchema = z.object({
  fullName: z.string().optional(),
  nrcNumber: z.string().regex(/^\d{6}\/\d{2}\/\d$/).optional(),
  dateOfBirth: z.string().optional(),
  residentialAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  partyCommitment: z.string().optional(),
  jurisdiction: z.object({
    province: z.string().optional(),
    district: z.string().optional(),
    constituency: z.string().optional(),
    ward: z.string().optional(),
    branch: z.string().optional(),
    section: z.string().optional()
  }).optional(),
  status: z.string().optional(),
});
