import { db, labProfiles } from '@lab/db';
import { eq } from 'drizzle-orm';
import { UpdateLabProfile } from '@lab/contracts';

export class LabService {
  static async getProfile() {
    const [profile] = await db.select().from(labProfiles).limit(1);
    return profile || null;
  }

  static async updateProfile(data: UpdateLabProfile) {
    const [existing] = await db.select().from(labProfiles).limit(1);
    if (!existing) {
      throw new Error('Lab profile not found');
    }
    const [updated] = await db
      .update(labProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(labProfiles.id, existing.id))
      .returning();
    return updated;
  }
}
