import { pgTable, uuid, varchar, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders.js';
import { staffMembers } from './staff.js';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 30 }).notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  balanceAmount: numeric('balance_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('unpaid'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull().default('cash'),
  referenceNumber: varchar('reference_number', { length: 50 }),
  receivedBy: uuid('received_by').notNull().references(() => staffMembers.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
