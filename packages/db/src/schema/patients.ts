import { pgTable, uuid, varchar, integer, timestamp, date } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  mrn: varchar('mrn', { length: 30 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 20 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  ageYears: integer('age_years'),
  ageMonths: integer('age_months'),
  ageDays: integer('age_days'),
  phone: varchar('phone', { length: 25 }).notNull(),
  email: varchar('email', { length: 100 }),
  address: varchar('address', { length: 255 }),
  cnicOrId: varchar('cnic_or_id', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
