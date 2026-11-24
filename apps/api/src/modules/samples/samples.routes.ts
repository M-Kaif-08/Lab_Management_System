import { Router } from 'express';
import { SamplesController } from './samples.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { auditLog } from '../../middlewares/auditLogger.js';
import {
  SampleSearchQuerySchema,
  CollectSampleSchema,
  ReceiveSampleSchema,
  ProcessSampleSchema,
  RejectSampleSchema,
  RecollectSampleSchema
} from '@lab/contracts';

export const samplesRouter = Router();

samplesRouter.use(authenticate);

samplesRouter.get(
  '/',
  authorize('sample:collect'),
  validateQuery(SampleSearchQuerySchema),
  SamplesController.search
);

samplesRouter.get(
  '/:id',
  authorize('sample:collect'),
  SamplesController.getById
);

samplesRouter.post(
  '/:id/collect',
  authorize('sample:collect'),
  validateBody(CollectSampleSchema),
  auditLog('COLLECT_SAMPLE', 'sample'),
  SamplesController.collect
);

samplesRouter.post(
  '/:id/receive',
  authorize('sample:process'),
  validateBody(ReceiveSampleSchema),
  auditLog('RECEIVE_SAMPLE', 'sample'),
  SamplesController.receive
);

samplesRouter.post(
  '/:id/process',
  authorize('sample:process'),
  validateBody(ProcessSampleSchema),
  auditLog('PROCESS_SAMPLE', 'sample'),
  SamplesController.process
);

samplesRouter.post(
  '/:id/reject',
  authorize('sample:reject'),
  validateBody(RejectSampleSchema),
  auditLog('REJECT_SAMPLE', 'sample'),
  SamplesController.reject
);

samplesRouter.post(
  '/:id/recollect',
  authorize('sample:collect'),
  validateBody(RecollectSampleSchema),
  auditLog('RECOLLECT_SAMPLE', 'sample'),
  SamplesController.recollect
);
