import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { orders, orderItems } from './orders.js';
import { staffMembers } from './staff.js';

export const samples = pgTable('samples', {
  id: uuid('id').primaryKey().defaultRandom(),
  barcode: varchar('barcode', { length: 40 }).notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  sampleType: varchar('sample_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  collectedBy: uuid('collected_by').references(() => staffMembers.id),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  receivedBy: uuid('received_by').references(() => staffMembers.id),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  rejectionReason: varchar('rejection_reason', { length: 100 }),
  rejectionNotes: text('rejection_notes'),
  replacesSampleId: uuid('replaces_sample_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sampleItems = pgTable('sample_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sampleId: uuid('sample_id').notNull().references(() => samples.id, { onDelete: 'cascade' }),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const sampleEvents = pgTable('sample_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sampleId: uuid('sample_id').notNull().references(() => samples.id, { onDelete: 'cascade' }),
  fromStatus: varchar('from_status', { length: 30 }),
  toStatus: varchar('to_status', { length: 30 }).notNull(),
  actorId: uuid('actor_id').references(() => staffMembers.id),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
