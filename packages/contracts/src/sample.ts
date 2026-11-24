import { z } from 'zod';

export const SampleStatusEnum = z.enum([
  'pending',
  'collected',
  'received',
  'processing',
  'completed',
  'rejected'
]);
export type SampleStatus = z.infer<typeof SampleStatusEnum>;

export const SampleRejectionReasonEnum = z.enum([
  'hemolyzed',
  'clotted',
  'insufficient_volume',
  'improper_container',
  'mislabelled',
  'contaminated',
  'temperature_compromised',
  'other'
]);
export type SampleRejectionReason = z.infer<typeof SampleRejectionReasonEnum>;

export const SampleEventSchema = z.object({
  id: z.string().uuid(),
  sampleId: z.string().uuid(),
  fromStatus: z.string().nullable().optional(),
  toStatus: z.string(),
  actorId: z.string().uuid().nullable().optional(),
  actorName: z.string().optional(),
  occurredAt: z.string(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});
export type SampleEvent = z.infer<typeof SampleEventSchema>;

export const SampleSchema = z.object({
  id: z.string().uuid(),
  barcode: z.string().min(4).max(40),
  orderId: z.string().uuid(),
  orderNumber: z.string().optional(),
  patientName: z.string().optional(),
  patientMrn: z.string().optional(),
  sampleType: z.string().min(2).max(50),
  status: SampleStatusEnum,
  collectedAt: z.string().nullable().optional(),
  collectedBy: z.string().nullable().optional(),
  collectedByName: z.string().optional(),
  receivedAt: z.string().nullable().optional(),
  receivedBy: z.string().nullable().optional(),
  receivedByName: z.string().optional(),
  rejectionReason: z.string().nullable().optional(),
  rejectionNotes: z.string().nullable().optional(),
  replacesSampleId: z.string().uuid().nullable().optional(),
  events: z.array(SampleEventSchema).optional(),
  createdAt: z.string()
});
export type Sample = z.infer<typeof SampleSchema>;

export const CollectSampleSchema = z.object({
  notes: z.string().max(255).optional()
});
export type CollectSample = z.infer<typeof CollectSampleSchema>;

export const ReceiveSampleSchema = z.object({
  notes: z.string().max(255).optional()
});
export type ReceiveSample = z.infer<typeof ReceiveSampleSchema>;

export const ProcessSampleSchema = z.object({
  notes: z.string().max(255).optional()
});
export type ProcessSample = z.infer<typeof ProcessSampleSchema>;

export const RejectSampleSchema = z.object({
  reason: SampleRejectionReasonEnum,
  notes: z.string().max(500).optional()
});
export type RejectSample = z.infer<typeof RejectSampleSchema>;

export const RecollectSampleSchema = z.object({
  reason: z.string().max(500).optional()
});
export type RecollectSample = z.infer<typeof RecollectSampleSchema>;

export const SampleSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: SampleStatusEnum.optional(),
  query: z.string().optional(),
  sampleType: z.string().optional()
});
export type SampleSearchQuery = z.infer<typeof SampleSearchQuerySchema>;
