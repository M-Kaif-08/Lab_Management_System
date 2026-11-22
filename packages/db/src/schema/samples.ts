import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders.js';
import { staffMembers } from './staff.js';

export const samples = pgTable('samples', {
  id: uuid('id').primaryKey().defaultRandom(),
  barcode: varchar('barcode', { length: 30 }).notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  sampleType: varchar('sample_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending_collection'),
  collectedBy: uuid('collected_by').references(() => staffMembers.id),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  rejectionReason: varchar('rejection_reason', { length: 100 }),
  rejectionNotes: text('rejection_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
