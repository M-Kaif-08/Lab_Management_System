import { z } from 'zod';

export const ResultFlagEnum = z.enum([
  'NORMAL',
  'LOW',
  'HIGH',
  'CRITICAL_LOW',
  'CRITICAL_HIGH',
  'ABNORMAL'
]);
export type ResultFlag = z.infer<typeof ResultFlagEnum>;

export const ResultStatusEnum = z.enum([
  'draft',
  'submitted',
  'verified',
  'rejected'
]);
export type ResultStatus = z.infer<typeof ResultStatusEnum>;

export const TestResultItemSchema = z.object({
  parameterId: z.string().uuid(),
  parameterName: z.string(),
  value: z.string(),
  unit: z.string().nullable().optional(),
  flag: ResultFlagEnum.default('NORMAL'),
  referenceRangeText: z.string().nullable().optional()
});
export type TestResultItem = z.infer<typeof TestResultItemSchema>;

export const EnterResultsSchema = z.object({
  orderItemId: z.string().uuid(),
  results: z.array(TestResultItemSchema),
  technicianNotes: z.string().max(500).nullable().optional()
});
export type EnterResults = z.infer<typeof EnterResultsSchema>;
