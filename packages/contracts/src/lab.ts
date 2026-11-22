import { z } from 'zod';

export const LabProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  tagline: z.string().max(150).nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  phone: z.string().min(5).max(30),
  email: z.string().email().nullable().optional(),
  address: z.string().min(5).max(255),
  city: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  timezone: z.string().default('Asia/Karachi'),
  currency: z.string().default('PKR'),
  reportHeader: z.string().nullable().optional(),
  reportFooter: z.string().nullable().optional(),
  updatedAt: z.string().optional()
});
export type LabProfile = z.infer<typeof LabProfileSchema>;

export const UpdateLabProfileSchema = LabProfileSchema.omit({
  id: true,
  updatedAt: true
}).partial();
export type UpdateLabProfile = z.infer<typeof UpdateLabProfileSchema>;
