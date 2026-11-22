import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { orderItems } from './orders.js';
import { testParameters } from './catalog.js';
import { staffMembers } from './staff.js';

export const testResults = pgTable('test_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  parameterId: uuid('parameter_id').notNull().references(() => testParameters.id),
  value: text('value').notNull(),
  flag: varchar('flag', { length: 20 }).notNull().default('NORMAL'),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  enteredBy: uuid('entered_by').notNull().references(() => staffMembers.id),
  verifiedBy: uuid('verified_by').references(() => staffMembers.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
