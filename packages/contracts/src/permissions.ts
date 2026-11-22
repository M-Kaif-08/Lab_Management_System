import { z } from 'zod';

export const RoleNameEnum = z.enum([
  'lab_administrator',
  'receptionist',
  'technician',
  'authorized_reviewer',
  'cashier'
]);
export type RoleName = z.infer<typeof RoleNameEnum>;

export const PermissionEnum = z.enum([
  'staff:manage',
  'lab:manage',
  'patient:read',
  'patient:write',
  'catalog:read',
  'catalog:write',
  'order:create',
  'order:read',
  'sample:collect',
  'sample:process',
  'sample:reject',
  'result:enter',
  'result:approve',
  'report:release',
  'billing:manage',
  'audit:read'
]);
export type Permission = z.infer<typeof PermissionEnum>;

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleName, Permission[]> = {
  lab_administrator: [
    'staff:manage',
    'lab:manage',
    'catalog:write',
    'catalog:read',
    'patient:read',
    'patient:write',
    'order:read',
    'audit:read'
  ],
  receptionist: [
    'patient:read',
    'patient:write',
    'catalog:read',
    'order:create',
    'order:read',
    'report:release'
  ],
  technician: [
    'catalog:read',
    'order:read',
    'sample:collect',
    'sample:process',
    'sample:reject',
    'result:enter'
  ],
  authorized_reviewer: [
    'catalog:read',
    'order:read',
    'result:approve',
    'report:release'
  ],
  cashier: [
    'order:read',
    'billing:manage'
  ]
};
