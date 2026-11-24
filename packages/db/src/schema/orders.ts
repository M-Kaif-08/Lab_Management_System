import { pgTable, uuid, varchar, text, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients.js';
import { tests, panels } from './catalog.js';
import { staffMembers } from './staff.js';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 30 }).notNull().unique(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  patientSnapshot: jsonb('patient_snapshot'),
  createdBy: uuid('created_by').notNull().references(() => staffMembers.id),
  status: varchar('status', { length: 30 }).notNull().default('pending_sample'),
  referringDoctor: varchar('referring_doctor', { length: 100 }),
  clinicalNotes: text('clinical_notes'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  testId: uuid('test_id').notNull().references(() => tests.id),
  panelId: uuid('panel_id').references(() => panels.id, { onDelete: 'set null' }),
  testCode: varchar('test_code', { length: 30 }),
  testName: varchar('test_name', { length: 150 }),
  sampleType: varchar('sample_type', { length: 50 }),
  priceAtOrder: numeric('price_at_order', { precision: 10, scale: 2 }).notNull(),
  parametersSnapshot: jsonb('parameters_snapshot'),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
