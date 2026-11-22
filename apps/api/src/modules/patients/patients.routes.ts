import { Router } from 'express';
import { PatientsController } from './patients.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { auditLog } from '../../middlewares/auditLogger.js';
import { CreatePatientSchema, UpdatePatientSchema, PatientSearchQuerySchema } from '@lab/contracts';

export const patientsRouter = Router();

patientsRouter.use(authenticate);

patientsRouter.get(
  '/',
  authorize('patient:read'),
  validateQuery(PatientSearchQuerySchema),
  PatientsController.search
);

patientsRouter.post(
  '/',
  authorize('patient:write'),
  validateBody(CreatePatientSchema),
  auditLog('CREATE_PATIENT', 'patient'),
  PatientsController.create
);

patientsRouter.get(
  '/:id',
  authorize('patient:read'),
  PatientsController.getById
);

patientsRouter.put(
  '/:id',
  authorize('patient:write'),
  validateBody(UpdatePatientSchema),
  auditLog('UPDATE_PATIENT', 'patient'),
  PatientsController.update
);
