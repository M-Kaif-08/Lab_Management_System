import { z } from 'zod';
import { RoleNameEnum, PermissionEnum } from './permissions.js';

export const LoginRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const StaffUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean(),
  roles: z.array(RoleNameEnum),
  permissions: z.array(PermissionEnum)
});
export type StaffUser = z.infer<typeof StaffUserSchema>;

export const AuthResponseSchema = z.object({
  user: StaffUserSchema,
  token: z.string()
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).regex(/[A-Za-z]/, 'Must contain letters').regex(/[0-9]/, 'Must contain numbers')
});
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
