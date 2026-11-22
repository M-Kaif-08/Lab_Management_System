import { z } from 'zod';

export const GenderEnum = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof GenderEnum>;

export const PatientSchema = z.object({
  id: z.string().uuid(),
  mrn: z.string().min(3).max(30),
  fullName: z.string().min(2).max(100),
  gender: GenderEnum,
  dateOfBirth: z.string().nullable().optional(),
  ageYears: z.number().int().min(0).max(150).nullable().optional(),
  ageMonths: z.number().int().min(0).max(11).nullable().optional(),
  ageDays: z.number().int().min(0).max(30).nullable().optional(),
  phone: z.string().min(7).max(25),
  email: z.string().email().nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  cnicOrId: z.string().max(50).nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type Patient = z.infer<typeof PatientSchema>;

export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  mrn: true,
  createdAt: true,
  updatedAt: true
});
export type CreatePatient = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = CreatePatientSchema.partial();
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;

export const PatientSearchQuerySchema = z.object({
  query: z.string().optional(),
  phone: z.string().optional(),
  mrn: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
export type PatientSearchQuery = z.infer<typeof PatientSearchQuerySchema>;
