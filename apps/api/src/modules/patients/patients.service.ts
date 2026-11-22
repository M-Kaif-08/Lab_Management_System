import { db, patients } from '@lab/db';
import { eq, or, ilike, desc, count } from 'drizzle-orm';
import { CreatePatient, UpdatePatient, PatientSearchQuery } from '@lab/contracts';

export class PatientsService {
  static async generateMRN(): Promise<string> {
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [result] = await db.select({ total: count() }).from(patients);
    const nextSeq = (Number(result?.total || 0) + 1).toString().padStart(4, '0');
    return `MRN-${datePrefix}-${nextSeq}`;
  }

  static async create(data: CreatePatient) {
    const mrn = await this.generateMRN();
    const [patient] = await db.insert(patients).values({
      ...data,
      mrn
    }).returning();
    return patient;
  }

  static async search(query: PatientSearchQuery) {
    const offset = (query.page - 1) * query.limit;
    let whereCondition: any;

    if (query.query) {
      whereCondition = or(
        ilike(patients.fullName, `%${query.query}%`),
        ilike(patients.phone, `%${query.query}%`),
        ilike(patients.mrn, `%${query.query}%`)
      );
    }

    const items = await db
      .select()
      .from(patients)
      .where(whereCondition)
      .orderBy(desc(patients.createdAt))
      .limit(query.limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(patients)
      .where(whereCondition);

    return {
      items,
      total: Number(totalResult?.total || 0),
      page: query.page,
      limit: query.limit
    };
  }

  static async getById(id: string) {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) throw new Error('Patient not found');
    return patient;
  }

  static async update(id: string, data: UpdatePatient) {
    const [updated] = await db
      .update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    if (!updated) throw new Error('Patient not found');
    return updated;
  }
}
