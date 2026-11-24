import { z } from 'zod';

export const OrderStatusEnum = z.enum([
  'draft',
  'pending_sample',
  'in_progress',
  'partially_completed',
  'completed',
  'cancelled'
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const CreateOrderSchema = z.object({
  patientId: z.string().uuid(),
  referringDoctor: z.string().max(100).nullable().optional(),
  clinicalNotes: z.string().max(500).nullable().optional(),
  testIds: z.array(z.string().uuid()).default([]),
  panelIds: z.array(z.string().uuid()).default([])
}).refine(data => data.testIds.length > 0 || data.panelIds.length > 0, {
  message: 'Select at least one test or panel'
});
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export const OrderItemParameterSnapshotSchema = z.object({
  parameterId: z.string().uuid().optional(),
  name: z.string(),
  unit: z.string().nullable().optional(),
  resultType: z.string(),
  ranges: z.array(z.any()).optional()
});
export type OrderItemParameterSnapshot = z.infer<typeof OrderItemParameterSnapshotSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  testId: z.string().uuid(),
  panelId: z.string().uuid().nullable().optional(),
  testCode: z.string(),
  testName: z.string(),
  sampleType: z.string(),
  priceAtOrder: z.number().min(0),
  parametersSnapshot: z.array(z.any()).optional(),
  status: z.string()
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const PatientSnapshotSchema = z.object({
  patientNumber: z.string(),
  fullName: z.string(),
  gender: z.string(),
  age: z.string().optional(),
  dateOfBirth: z.string().nullable().optional(),
  phone: z.string().optional()
});
export type PatientSnapshot = z.infer<typeof PatientSnapshotSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  patientId: z.string().uuid(),
  patientSnapshot: PatientSnapshotSchema.optional(),
  status: OrderStatusEnum,
  referringDoctor: z.string().nullable().optional(),
  clinicalNotes: z.string().nullable().optional(),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  cancelledAt: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional()
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  query: z.string().optional(),
  status: OrderStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
export type OrderSearchQuery = z.infer<typeof OrderSearchQuerySchema>;

export const CancelOrderSchema = z.object({
  reason: z.string().min(3).max(500)
});
export type CancelOrder = z.infer<typeof CancelOrderSchema>;
