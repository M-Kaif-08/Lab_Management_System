import {
  db,
  orders,
  orderItems,
  patients,
  tests,
  testParameters,
  referenceRanges,
  panels,
  panelItems,
  samples,
  sampleItems,
  sampleEvents
} from '@lab/db';
import { eq, or, ilike, desc, count, inArray } from 'drizzle-orm';
import { CreateOrder, OrderSearchQuery, CancelOrder } from '@lab/contracts';

export class OrdersService {
  static async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [result] = await db.select({ total: count() }).from(orders);
    const nextSeq = (Number(result?.total || 0) + 1).toString().padStart(4, '0');
    return `ORD-${datePrefix}-${nextSeq}`;
  }

  static async generateSampleBarcode(prefix: string = 'SMP'): Promise<string> {
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [result] = await db.select({ total: count() }).from(samples);
    const nextSeq = (Number(result?.total || 0) + 1).toString().padStart(4, '0');
    return `${prefix}-${datePrefix}-${nextSeq}`;
  }

  static async createOrder(data: CreateOrder, createdByUserId: string) {
    // 1. Fetch Patient
    const [patient] = await db.select().from(patients).where(eq(patients.id, data.patientId)).limit(1);
    if (!patient) throw new Error('Patient not found');

    const patientSnapshot = {
      patientNumber: patient.mrn,
      fullName: patient.fullName,
      gender: patient.gender,
      age: patient.ageYears ? `${patient.ageYears} yrs` : undefined,
      dateOfBirth: patient.dateOfBirth
        ? typeof patient.dateOfBirth === 'string'
          ? patient.dateOfBirth
          : (patient.dateOfBirth as any).toISOString().split('T')[0]
        : null,
      phone: patient.phone
    };

    // 2. Resolve Tests to book (individual tests + tests inside panels)
    interface TestToBook {
      testId: string;
      panelId?: string;
      panelName?: string;
    }
    const itemsToBook: TestToBook[] = [];

    // Add standalone tests
    for (const testId of data.testIds || []) {
      itemsToBook.push({ testId });
    }

    // Expand panels into individual tests
    for (const panelId of data.panelIds || []) {
      const [panel] = await db.select().from(panels).where(eq(panels.id, panelId)).limit(1);
      if (panel) {
        const pItems = await db.select().from(panelItems).where(eq(panelItems.panelId, panel.id));
        for (const pi of pItems) {
          itemsToBook.push({ testId: pi.testId, panelId: panel.id, panelName: panel.name });
        }
      }
    }

    if (itemsToBook.length === 0) {
      throw new Error('No valid tests selected');
    }

    // 3. Fetch test catalog definitions, parameters, and ranges
    const allTestIds = itemsToBook.map((i) => i.testId);
    const catalogTests = await db.select().from(tests).where(inArray(tests.id, allTestIds));
    const catalogParams = await db.select().from(testParameters).where(inArray(testParameters.testId, allTestIds));
    const paramIds = catalogParams.map((p) => p.id);
    const catalogRanges = paramIds.length > 0 ? await db.select().from(referenceRanges).where(inArray(referenceRanges.parameterId, paramIds)) : [];

    // Calculate total price
    let totalAmount = 0;
    const testMap = new Map(catalogTests.map((t) => [t.id, t]));

    for (const item of itemsToBook) {
      const t = testMap.get(item.testId);
      if (t) totalAmount += Number(t.price);
    }

    const orderNumber = await this.generateOrderNumber();

    // 4. Insert Order
    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        patientId: patient.id,
        patientSnapshot,
        createdBy: createdByUserId,
        status: 'pending_sample',
        referringDoctor: data.referringDoctor,
        clinicalNotes: data.clinicalNotes,
        totalAmount: totalAmount.toFixed(2),
        paidAmount: '0.00'
      })
      .returning();

    // 5. Insert Order Items with parameter snapshots
    const createdOrderItems: any[] = [];
    for (const item of itemsToBook) {
      const testDef = testMap.get(item.testId);
      if (!testDef) continue;

      const testParams = catalogParams.filter((p) => p.testId === testDef.id);
      const paramsSnapshot = testParams.map((p) => ({
        parameterId: p.id,
        name: p.name,
        unit: p.unit,
        resultType: p.resultType,
        ranges: catalogRanges.filter((r) => r.parameterId === p.id)
      }));

      const [orderItem] = await db
        .insert(orderItems)
        .values({
          orderId: createdOrder.id,
          testId: testDef.id,
          panelId: item.panelId,
          testCode: testDef.code,
          testName: testDef.name,
          sampleType: testDef.sampleType,
          priceAtOrder: Number(testDef.price).toFixed(2),
          parametersSnapshot: paramsSnapshot,
          status: 'pending'
        })
        .returning();

      createdOrderItems.push(orderItem);
    }

    // 6. Group by sampleType to create pending samples
    const sampleTypeGroups = new Map<string, typeof createdOrderItems>();
    for (const oi of createdOrderItems) {
      const st = oi.sampleType || 'Default';
      const existing = sampleTypeGroups.get(st) || [];
      existing.push(oi);
      sampleTypeGroups.set(st, existing);
    }

    let sampleCounter = 0;
    for (const [sampleType, linkedItems] of sampleTypeGroups.entries()) {
      sampleCounter++;
      const barcode = await this.generateSampleBarcode(`SMP-${sampleCounter}`);

      const [sampleRecord] = await db
        .insert(samples)
        .values({
          barcode,
          orderId: createdOrder.id,
          sampleType,
          status: 'pending'
        })
        .returning();

      // Link sample to order items
      for (const item of linkedItems) {
        await db.insert(sampleItems).values({
          sampleId: sampleRecord.id,
          orderItemId: item.id
        }).onConflictDoNothing();
      }

      // Record initial event
      await db.insert(sampleEvents).values({
        sampleId: sampleRecord.id,
        fromStatus: null,
        toStatus: 'pending',
        actorId: createdByUserId,
        notes: `Sample generated automatically upon order booking for ${sampleType}`
      });
    }

    return this.getOrderById(createdOrder.id);
  }

  static async searchOrders(query: OrderSearchQuery) {
    const offset = (query.page - 1) * query.limit;
    let whereCondition: any;

    if (query.query) {
      whereCondition = or(
        ilike(orders.orderNumber, `%${query.query}%`),
        ilike(orders.referringDoctor, `%${query.query}%`)
      );
    }

    if (query.status) {
      whereCondition = eq(orders.status, query.status);
    }

    const orderList = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        patientId: orders.patientId,
        patientSnapshot: orders.patientSnapshot,
        status: orders.status,
        referringDoctor: orders.referringDoctor,
        clinicalNotes: orders.clinicalNotes,
        totalAmount: orders.totalAmount,
        paidAmount: orders.paidAmount,
        cancelledAt: orders.cancelledAt,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        patientName: patients.fullName,
        patientMrn: patients.mrn
      })
      .from(orders)
      .innerJoin(patients, eq(orders.patientId, patients.id))
      .where(whereCondition)
      .orderBy(desc(orders.createdAt))
      .limit(query.limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(orders)
      .where(whereCondition);

    return {
      items: orderList.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        paidAmount: Number(o.paidAmount),
        createdAt: o.createdAt.toISOString()
      })),
      total: Number(totalResult?.total || 0),
      page: query.page,
      limit: query.limit
    };
  }

  static async getOrderById(id: string) {
    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        patientId: orders.patientId,
        patientSnapshot: orders.patientSnapshot,
        status: orders.status,
        referringDoctor: orders.referringDoctor,
        clinicalNotes: orders.clinicalNotes,
        totalAmount: orders.totalAmount,
        paidAmount: orders.paidAmount,
        cancelledAt: orders.cancelledAt,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        patientName: patients.fullName,
        patientMrn: patients.mrn,
        patientPhone: patients.phone
      })
      .from(orders)
      .innerJoin(patients, eq(orders.patientId, patients.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) throw new Error('Order not found');

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const orderSamples = await db.select().from(samples).where(eq(samples.orderId, order.id));

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      createdAt: order.createdAt.toISOString(),
      items: items.map((i) => ({
        ...i,
        priceAtOrder: Number(i.priceAtOrder)
      })),
      samples: orderSamples
    };
  }

  static async cancelOrder(id: string, cancelData: CancelOrder, cancelledByUserId: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new Error('Order not found');
    if (order.status === 'cancelled') throw new Error('Order is already cancelled');

    const [updated] = await db
      .update(orders)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: cancelData.reason,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();

    // Cancel all pending items
    await db
      .update(orderItems)
      .set({ status: 'cancelled' })
      .where(eq(orderItems.orderId, id));

    return this.getOrderById(updated.id);
  }
}
