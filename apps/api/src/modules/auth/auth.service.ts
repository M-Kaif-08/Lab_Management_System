import { db, staffMembers, staffRoles, roles, rolePermissions, permissions } from '@lab/db';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { LoginRequest, RoleName, Permission } from '@lab/contracts';

export class AuthService {
  static async login(data: LoginRequest) {
    const [staff] = await db.select().from(staffMembers).where(eq(staffMembers.username, data.username)).limit(1);

    if (!staff || !staff.isActive) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await argon2.verify(staff.passwordHash, data.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    // Fetch roles
    const userRoles = await db
      .select({ roleName: roles.name })
      .from(staffRoles)
      .innerJoin(roles, eq(staffRoles.roleId, roles.id))
      .where(eq(staffRoles.staffId, staff.id));

    // Fetch permissions
    const userPermissions = await db
      .select({ permCode: permissions.code })
      .from(staffRoles)
      .innerJoin(rolePermissions, eq(staffRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(staffRoles.staffId, staff.id));

    const roleNames = userRoles.map(r => r.roleName as RoleName);
    const permCodes = Array.from(new Set(userPermissions.map(p => p.permCode as Permission)));

    const userPayload = {
      id: staff.id,
      username: staff.username,
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      isActive: staff.isActive,
      roles: roleNames,
      permissions: permCodes
    };

    const token = jwt.sign(userPayload, env.JWT_SECRET, {
      expiresIn: '8h'
    });

    return { user: userPayload, token };
  }
}
