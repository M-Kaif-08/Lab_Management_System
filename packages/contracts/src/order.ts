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
  testIds: z.array(z.string().uuid()).min(1, 'Select at least one test')
});
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  testId: z.string().uuid(),
  testName: z.string(),
  testCode: z.string(),
  priceAtOrder: z.number().min(0),
  status: z.string()
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  patientId: z.string().uuid(),
  patientName: z.string(),
  patientMrn: z.string(),
  status: OrderStatusEnum,
  referringDoctor: z.string().nullable().optional(),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string()
});
export type Order = z.infer<typeof OrderSchema>;
