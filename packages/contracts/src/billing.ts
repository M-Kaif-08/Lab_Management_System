import { z } from 'zod';

export const PaymentMethodEnum = z.enum(['cash', 'card', 'online', 'bank_transfer']);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const InvoiceStatusEnum = z.enum(['unpaid', 'partially_paid', 'paid', 'refunded']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  orderId: z.string().uuid(),
  totalAmount: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  netAmount: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  balanceAmount: z.number().min(0),
  status: InvoiceStatusEnum,
  createdAt: z.string()
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: PaymentMethodEnum,
  referenceNumber: z.string().max(50).optional(),
  notes: z.string().max(255).optional()
});
export type RecordPayment = z.infer<typeof RecordPaymentSchema>;
