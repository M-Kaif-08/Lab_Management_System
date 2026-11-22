import { db } from '../client.js';
import { roles, permissions, rolePermissions, staffMembers, staffRoles, labProfiles } from '../schema/index.js';
import { ROLE_DEFAULT_PERMISSIONS } from '@lab/contracts';
import { eq } from 'drizzle-orm';

export async function seedInitialAdmin() {
  console.log('Seeding roles, permissions, and default admin...');

  // 1. Seed All Permissions
  const permMap = new Map<string, string>();
  const allUniquePerms = Array.from(new Set(Object.values(ROLE_DEFAULT_PERMISSIONS).flat()));

  for (const permCode of allUniquePerms) {
    const [existing] = await db.select().from(permissions).where(eq(permissions.code, permCode)).limit(1);
    if (existing) {
      permMap.set(permCode, existing.id);
    } else {
      const [inserted] = await db.insert(permissions).values({
        code: permCode,
        description: `Permission: ${permCode}`
      }).returning();
      if (inserted) permMap.set(permCode, inserted.id);
    }
  }

  // 2. Seed Roles and link permissions
  const roleMap = new Map<string, string>();
  for (const [roleName, perms] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    let roleId: string;
    const [existingRole] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (existingRole) {
      roleId = existingRole.id;
    } else {
      const [insertedRole] = await db.insert(roles).values({
        name: roleName,
        description: `Role: ${roleName}`
      }).returning();
      roleId = insertedRole.id;
    }
    roleMap.set(roleName, roleId);

    // Link permissions to role
    for (const permCode of perms) {
      const permId = permMap.get(permCode);
      if (permId) {
        await db.insert(rolePermissions).values({
          roleId,
          permissionId: permId
        }).onConflictDoNothing();
      }
    }
  }

  // 3. Seed Default Administrator Staff Member
  // Pre-hashed Argon2id for password: "Admin@1234"
  const defaultAdminHash = '$argon2id$v=19$m=65536,t=3,p=4$EbOynfRYM2kf6PjDz05rQw$SbDcO0obyAqm1MWvshiVXwCFaRlzEylojPW9OtctKrg';

  const [existingAdmin] = await db.select().from(staffMembers).where(eq(staffMembers.username, 'admin')).limit(1);
  let adminId: string;

  if (existingAdmin) {
    adminId = existingAdmin.id;
    console.log('Admin account already exists.');
  } else {
    const [insertedAdmin] = await db.insert(staffMembers).values({
      username: 'admin',
      passwordHash: defaultAdminHash,
      fullName: 'System Administrator',
      email: 'admin@labsystem.local',
      phone: '+92 300 0000000',
      isActive: true
    }).returning();
    adminId = insertedAdmin.id;
    console.log('Created default admin (Username: admin | Password: Admin@1234)');
  }

  // Assign 'lab_administrator' role to admin
  const adminRoleId = roleMap.get('lab_administrator');
  if (adminRoleId && adminId) {
    await db.insert(staffRoles).values({
      staffId: adminId,
      roleId: adminRoleId
    }).onConflictDoNothing();
  }

  // 4. Seed Default Lab Profile
  const [existingProfile] = await db.select().from(labProfiles).limit(1);
  if (!existingProfile) {
    await db.insert(labProfiles).values({
      name: 'Apex Diagnostic Centre',
      tagline: 'Reliable & Certified Clinical Laboratory',
      phone: '+92 300 1234567',
      email: 'contact@apexlab.com',
      address: '12-A Commercial Plaza, Main Boulevard',
      city: 'Lahore',
      country: 'Pakistan',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      reportHeader: 'APEX DIAGNOSTIC CENTRE - ACCREDITED CLINICAL LAB',
      reportFooter: 'This report is electronically verified and does not require a physical signature.'
    });
    console.log('Default Lab Profile created.');
  }

  console.log('Admin & System Roles setup complete!');
}
