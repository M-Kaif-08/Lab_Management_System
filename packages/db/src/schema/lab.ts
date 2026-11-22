import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const labProfiles = pgTable('lab_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  tagline: varchar('tagline', { length: 150 }),
  logoUrl: text('logo_url'),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 100 }),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 50 }).notNull(),
  country: varchar('country', { length: 50 }).notNull().default('Pakistan'),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Asia/Karachi'),
  currency: varchar('currency', { length: 10 }).notNull().default('PKR'),
  reportHeader: text('report_header'),
  reportFooter: text('report_footer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
