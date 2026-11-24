import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const specimenTypes = pgTable('specimen_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  sampleType: varchar('sample_type', { length: 50 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  turnaroundHours: integer('turnaround_hours').notNull().default(24),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const testParameters = pgTable('test_parameters', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  unit: varchar('unit', { length: 30 }),
  resultType: varchar('result_type', { length: 20 }).notNull().default('numeric'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const referenceRanges = pgTable('reference_ranges', {
  id: uuid('id').primaryKey().defaultRandom(),
  parameterId: uuid('parameter_id').notNull().references(() => testParameters.id, { onDelete: 'cascade' }),
  gender: varchar('gender', { length: 20 }).notNull().default('all'),
  minAgeYears: integer('min_age_years'),
  maxAgeYears: integer('max_age_years'),
  normalLow: numeric('normal_low', { precision: 10, scale: 2 }),
  normalHigh: numeric('normal_high', { precision: 10, scale: 2 }),
  criticalLow: numeric('critical_low', { precision: 10, scale: 2 }),
  criticalHigh: numeric('critical_high', { precision: 10, scale: 2 }),
  normalText: text('normal_text')
});

export const panels = pgTable('panels', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const panelItems = pgTable('panel_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  panelId: uuid('panel_id').notNull().references(() => panels.id, { onDelete: 'cascade' }),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
