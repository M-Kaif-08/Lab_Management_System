import { z } from 'zod';

export const SampleStatusEnum = z.enum([
  'pending_collection',
  'collected',
  'received_in_lab',
  'processing',
  'rejected'
]);
export type SampleStatus = z.infer<typeof SampleStatusEnum>;

export const SampleSchema = z.object({
  id: z.string().uuid(),
  barcode: z.string().min(4).max(30),
  orderId: z.string().uuid(),
  sampleType: z.string().min(2).max(50),
  status: SampleStatusEnum,
  collectedAt: z.string().nullable().optional(),
  collectedBy: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  rejectionNotes: z.string().nullable().optional()
});
export type Sample = z.infer<typeof SampleSchema>;

export const RejectSampleSchema = z.object({
  sampleId: z.string().uuid(),
  reason: z.enum([
    'hemolyzed',
    'clotted',
    'insufficient_volume',
    'improper_container',
    'mislabelled'
  ]),
  notes: z.string().max(255).optional()
});
export type RejectSample = z.infer<typeof RejectSampleSchema>;
