import { Router } from 'express';
import { LabController } from './lab.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody } from '../../middlewares/validate.js';
import { UpdateLabProfileSchema } from '@lab/contracts';

export const labRouter = Router();

labRouter.get('/profile', LabController.getProfile);
labRouter.put(
  '/profile',
  authenticate,
  authorize('lab:manage'),
  validateBody(UpdateLabProfileSchema),
  LabController.updateProfile
);
