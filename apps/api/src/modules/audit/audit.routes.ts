import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.get('/', authorize('audit:read'), AuditController.list);
