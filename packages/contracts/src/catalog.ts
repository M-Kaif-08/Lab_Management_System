import { z } from 'zod';

export const ResultTypeEnum = z.enum(['numeric', 'text', 'options', 'ratio']);
export type ResultType = z.infer<typeof ResultTypeEnum>;

export const ReferenceRangeSchema = z.object({
  id: z.string().uuid().optional(),
  parameterId: z.string().uuid(),
  gender: z.enum(['all', 'male', 'female']).default('all'),
  minAgeYears: z.number().nullable().optional(),
  maxAgeYears: z.number().nullable().optional(),
  normalLow: z.number().nullable().optional(),
  normalHigh: z.number().nullable().optional(),
  criticalLow: z.number().nullable().optional(),
  criticalHigh: z.number().nullable().optional(),
  normalText: z.string().nullable().optional()
});
export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;

export const TestParameterSchema = z.object({
  id: z.string().uuid().optional(),
  testId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  unit: z.string().max(30).nullable().optional(),
  resultType: ResultTypeEnum,
  options: z.array(z.string()).nullable().optional(),
  sortOrder: z.number().int().default(0),
  ranges: z.array(ReferenceRangeSchema).optional()
});
export type TestParameter = z.infer<typeof TestParameterSchema>;

export const TestCatalogItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(150),
  department: z.string().min(2).max(50),
  sampleType: z.string().min(2).max(50),
  price: z.number().min(0),
  turnaroundHours: z.number().int().positive().default(24),
  isActive: z.boolean().default(true),
  parameters: z.array(TestParameterSchema).optional()
});
export type TestCatalogItem = z.infer<typeof TestCatalogItemSchema>;
