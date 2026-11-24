import { z } from 'zod';

// Result Types
export const ResultTypeEnum = z.enum(['numeric', 'text', 'options', 'ratio']);
export type ResultType = z.infer<typeof ResultTypeEnum>;

// Specimen Types
export const SpecimenTypeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(100),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type SpecimenType = z.infer<typeof SpecimenTypeSchema>;

export const CreateSpecimenTypeSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  isActive: z.boolean().default(true)
});
export type CreateSpecimenType = z.infer<typeof CreateSpecimenTypeSchema>;

// Reference Ranges
export const ReferenceRangeSchema = z.object({
  id: z.string().uuid().optional(),
  parameterId: z.string().uuid().optional(),
  gender: z.enum(['all', 'male', 'female', 'other', 'unknown']).default('all'),
  minAgeYears: z.number().nullable().optional(),
  maxAgeYears: z.number().nullable().optional(),
  normalLow: z.number().nullable().optional(),
  normalHigh: z.number().nullable().optional(),
  criticalLow: z.number().nullable().optional(),
  criticalHigh: z.number().nullable().optional(),
  normalText: z.string().nullable().optional()
});
export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;

export const CreateReferenceRangeSchema = z.object({
  parameterId: z.string().uuid().optional(),
  gender: z.enum(['all', 'male', 'female', 'other', 'unknown']).default('all'),
  minAgeYears: z.number().int().min(0).nullable().optional(),
  maxAgeYears: z.number().int().min(0).nullable().optional(),
  normalLow: z.number().nullable().optional(),
  normalHigh: z.number().nullable().optional(),
  criticalLow: z.number().nullable().optional(),
  criticalHigh: z.number().nullable().optional(),
  normalText: z.string().max(200).nullable().optional()
});
export type CreateReferenceRange = z.infer<typeof CreateReferenceRangeSchema>;

// Test Parameters
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

export const CreateTestParameterSchema = z.object({
  name: z.string().min(1).max(100),
  unit: z.string().max(30).nullable().optional(),
  resultType: ResultTypeEnum.default('numeric'),
  options: z.array(z.string()).nullable().optional(),
  sortOrder: z.number().int().default(0),
  ranges: z.array(CreateReferenceRangeSchema).optional()
});
export type CreateTestParameter = z.infer<typeof CreateTestParameterSchema>;

// Test Catalog Items
export const TestCatalogItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(150),
  department: z.string().min(2).max(50),
  sampleType: z.string().min(2).max(50),
  price: z.number().min(0),
  turnaroundHours: z.number().int().positive().default(24),
  isActive: z.boolean().default(true),
  parameters: z.array(TestParameterSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type TestCatalogItem = z.infer<typeof TestCatalogItemSchema>;

export const CreateTestCatalogItemSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(150),
  department: z.string().min(2).max(50),
  sampleType: z.string().min(2).max(50),
  price: z.number().min(0),
  turnaroundHours: z.number().int().positive().default(24),
  isActive: z.boolean().default(true),
  parameters: z.array(CreateTestParameterSchema).optional()
});
export type CreateTestCatalogItem = z.infer<typeof CreateTestCatalogItemSchema>;

export const UpdateTestCatalogItemSchema = CreateTestCatalogItemSchema.partial();
export type UpdateTestCatalogItem = z.infer<typeof UpdateTestCatalogItemSchema>;

export const CatalogSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  query: z.string().optional(),
  department: z.string().optional(),
  sampleType: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional()
});
export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuerySchema>;

// Panels
export const PanelItemSchema = z.object({
  id: z.string().uuid().optional(),
  panelId: z.string().uuid().optional(),
  testId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
  test: TestCatalogItemSchema.optional()
});
export type PanelItem = z.infer<typeof PanelItemSchema>;

export const PanelSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(150),
  description: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  items: z.array(PanelItemSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type Panel = z.infer<typeof PanelSchema>;

export const CreatePanelSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(150),
  description: z.string().max(500).nullable().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  testIds: z.array(z.string().uuid()).min(1, 'Select at least one test for the panel')
});
export type CreatePanel = z.infer<typeof CreatePanelSchema>;

export const UpdatePanelSchema = CreatePanelSchema.partial();
export type UpdatePanel = z.infer<typeof UpdatePanelSchema>;
