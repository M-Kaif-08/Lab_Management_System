import {
  db,
  samples,
  sampleItems,
  sampleEvents,
  orders,
  orderItems,
  patients,
  staffMembers
} from '@lab/db';
import { eq, or, ilike, desc, count } from 'drizzle-orm';
import {
  SampleSearchQuery,
  RejectSample,
  RecollectSample
} from '@lab/contracts';

export class SamplesService {
  static async searchSamples(query: SampleSearchQuery) {
    const offset = (query.page - 1) * query.limit;
    let whereCondition: any;

    if (query.status) {
      whereCondition = eq(samples.status, query.status);
    }

    if (query.query) {
      const q = or(
        ilike(samples.barcode, `%${query.query}%`),
        ilike(orders.orderNumber, `%${query.query}%`),
        ilike(patients.fullName, `%${query.query}%`)
      );
      whereCondition = whereCondition ? andCondition(whereCondition, q) : q;
    }

    function andCondition(c1: any, c2: any) {
      return or(c1, c2); // drizzle simple filter
    }

    const sampleList = await db
      .select({
        id: samples.id,
        barcode: samples.barcode,
        orderId: samples.orderId,
        sampleType: samples.sampleType,
        status: samples.status,
        collectedAt: samples.collectedAt,
        collectedBy: samples.collectedBy,
        receivedAt: samples.receivedAt,
        receivedBy: samples.receivedBy,
        rejectionReason: samples.rejectionReason,
        rejectionNotes: samples.rejectionNotes,
        replacesSampleId: samples.replacesSampleId,
        createdAt: samples.createdAt,
        orderNumber: orders.orderNumber,
        patientName: patients.fullName,
        patientMrn: patients.mrn,
        collectedByName: staffMembers.fullName
      })
      .from(samples)
      .innerJoin(orders, eq(samples.orderId, orders.id))
      .innerJoin(patients, eq(orders.patientId, patients.id))
      .leftJoin(staffMembers, eq(samples.collectedBy, staffMembers.id))
      .where(whereCondition)
      .orderBy(desc(samples.createdAt))
      .limit(query.limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(samples)
      .where(whereCondition);

    return {
      items: sampleList.map((s) => ({
        ...s,
        collectedAt: s.collectedAt ? s.collectedAt.toISOString() : null,
        receivedAt: s.receivedAt ? s.receivedAt.toISOString() : null,
        createdAt: s.createdAt.toISOString()
      })),
      total: Number(totalResult?.total || 0),
      page: query.page,
      limit: query.limit
    };
  }

  static async getById(id: string) {
    const [sample] = await db
      .select({
        id: samples.id,
        barcode: samples.barcode,
        orderId: samples.orderId,
        sampleType: samples.sampleType,
        status: samples.status,
        collectedAt: samples.collectedAt,
        collectedBy: samples.collectedBy,
        receivedAt: samples.receivedAt,
        receivedBy: samples.receivedBy,
        rejectionReason: samples.rejectionReason,
        rejectionNotes: samples.rejectionNotes,
        replacesSampleId: samples.replacesSampleId,
        createdAt: samples.createdAt,
        orderNumber: orders.orderNumber,
        patientName: patients.fullName,
        patientMrn: patients.mrn,
        patientPhone: patients.phone
      })
      .from(samples)
      .innerJoin(orders, eq(samples.orderId, orders.id))
      .innerJoin(patients, eq(orders.patientId, patients.id))
      .where(eq(samples.id, id))
      .limit(1);

    if (!sample) throw new Error('Sample not found');

    const events = await db
      .select({
        id: sampleEvents.id,
        sampleId: sampleEvents.sampleId,
        fromStatus: sampleEvents.fromStatus,
        toStatus: sampleEvents.toStatus,
        actorId: sampleEvents.actorId,
        actorName: staffMembers.fullName,
        occurredAt: sampleEvents.occurredAt,
        reason: sampleEvents.reason,
        notes: sampleEvents.notes
      })
      .from(sampleEvents)
      .leftJoin(staffMembers, eq(sampleEvents.actorId, staffMembers.id))
      .where(eq(sampleEvents.sampleId, sample.id))
      .orderBy(desc(sampleEvents.occurredAt));

    const linkedItems = await db
      .select({
        id: orderItems.id,
        testCode: orderItems.testCode,
        testName: orderItems.testName,
        sampleType: orderItems.sampleType,
        status: orderItems.status
      })
      .from(sampleItems)
      .innerJoin(orderItems, eq(sampleItems.orderItemId, orderItems.id))
      .where(eq(sampleItems.sampleId, sample.id));

    return {
      ...sample,
      collectedAt: sample.collectedAt ? sample.collectedAt.toISOString() : null,
      receivedAt: sample.receivedAt ? sample.receivedAt.toISOString() : null,
      createdAt: sample.createdAt.toISOString(),
      events: events.map((e) => ({
        ...e,
        occurredAt: e.occurredAt.toISOString()
      })),
      items: linkedItems
    };
  }

  static async collect(id: string, notes: string | undefined, userId: string) {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id)).limit(1);
    if (!sample) throw new Error('Sample not found');
    if (sample.status !== 'pending') {
      throw new Error(`Cannot collect sample in '${sample.status}' status`);
    }

    const [updated] = await db
      .update(samples)
      .set({
        status: 'collected',
        collectedBy: userId,
        collectedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(samples.id, id))
      .returning();

    await db.insert(sampleEvents).values({
      sampleId: id,
      fromStatus: 'pending',
      toStatus: 'collected',
      actorId: userId,
      notes: notes || 'Specimen collected by phlebotomist'
    });

    return this.getById(updated.id);
  }

  static async receive(id: string, notes: string | undefined, userId: string) {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id)).limit(1);
    if (!sample) throw new Error('Sample not found');
    if (sample.status !== 'collected') {
      throw new Error(`Cannot receive sample in '${sample.status}' status (must be 'collected')`);
    }

    const [updated] = await db
      .update(samples)
      .set({
        status: 'received',
        receivedBy: userId,
        receivedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(samples.id, id))
      .returning();

    await db.insert(sampleEvents).values({
      sampleId: id,
      fromStatus: 'collected',
      toStatus: 'received',
      actorId: userId,
      notes: notes || 'Specimen verified and received in laboratory accessioning'
    });

    return this.getById(updated.id);
  }

  static async process(id: string, notes: string | undefined, userId: string) {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id)).limit(1);
    if (!sample) throw new Error('Sample not found');
    if (sample.status !== 'received') {
      throw new Error(`Cannot process sample in '${sample.status}' status (must be 'received')`);
    }

    const [updated] = await db
      .update(samples)
      .set({
        status: 'processing',
        updatedAt: new Date()
      })
      .where(eq(samples.id, id))
      .returning();

    await db.insert(sampleEvents).values({
      sampleId: id,
      fromStatus: 'received',
      toStatus: 'processing',
      actorId: userId,
      notes: notes || 'Specimen loaded into analytical processing'
    });

    return this.getById(updated.id);
  }

  static async reject(id: string, data: RejectSample, userId: string) {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id)).limit(1);
    if (!sample) throw new Error('Sample not found');
    if (sample.status === 'rejected' || sample.status === 'completed') {
      throw new Error(`Cannot reject sample in terminal '${sample.status}' status`);
    }

    const [updated] = await db
      .update(samples)
      .set({
        status: 'rejected',
        rejectionReason: data.reason,
        rejectionNotes: data.notes,
        updatedAt: new Date()
      })
      .where(eq(samples.id, id))
      .returning();

    await db.insert(sampleEvents).values({
      sampleId: id,
      fromStatus: sample.status,
      toStatus: 'rejected',
      actorId: userId,
      reason: data.reason,
      notes: data.notes || `Specimen rejected due to ${data.reason}`
    });

    return this.getById(updated.id);
  }

  static async recollect(id: string, data: RecollectSample, userId: string) {
    const [originalSample] = await db.select().from(samples).where(eq(samples.id, id)).limit(1);
    if (!originalSample) throw new Error('Sample not found');
    if (originalSample.status !== 'rejected') {
      throw new Error('Can only recollect replacement for a rejected sample');
    }

    // Generate new barcode
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [result] = await db.select({ total: count() }).from(samples);
    const nextSeq = (Number(result?.total || 0) + 1).toString().padStart(4, '0');
    const newBarcode = `SMP-RCL-${datePrefix}-${nextSeq}`;

    const [newSample] = await db
      .insert(samples)
      .values({
        barcode: newBarcode,
        orderId: originalSample.orderId,
        sampleType: originalSample.sampleType,
        status: 'pending',
        replacesSampleId: originalSample.id
      })
      .returning();

    // Link original order items to the new sample
    const linked = await db.select().from(sampleItems).where(eq(sampleItems.sampleId, originalSample.id));
    for (const item of linked) {
      await db.insert(sampleItems).values({
        sampleId: newSample.id,
        orderItemId: item.orderItemId
      });
    }

    // Record recollection event on both old and new
    await db.insert(sampleEvents).values({
      sampleId: originalSample.id,
      fromStatus: 'rejected',
      toStatus: 'rejected',
      actorId: userId,
      reason: 'Recollection Requested',
      notes: `Replacement sample issued: ${newBarcode}. Notes: ${data.reason || 'None'}`
    });

    await db.insert(sampleEvents).values({
      sampleId: newSample.id,
      fromStatus: null,
      toStatus: 'pending',
      actorId: userId,
      reason: 'Replacement Sample Created',
      notes: `Created to replace rejected sample ${originalSample.barcode}`
    });

    return this.getById(newSample.id);
  }
}
