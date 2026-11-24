import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { auditLog } from '../../middlewares/auditLogger.js';
import {
  CreateTestCatalogItemSchema,
  UpdateTestCatalogItemSchema,
  CatalogSearchQuerySchema,
  CreatePanelSchema,
  CreateSpecimenTypeSchema
} from '@lab/contracts';

export const catalogRouter = Router();

catalogRouter.use(authenticate);

// Specimen Types
catalogRouter.get(
  '/specimen-types',
  authorize('catalog:read'),
  CatalogController.listSpecimenTypes
);

catalogRouter.post(
  '/specimen-types',
  authorize('catalog:write'),
  validateBody(CreateSpecimenTypeSchema),
  auditLog('CREATE_SPECIMEN_TYPE', 'specimen_type'),
  CatalogController.createSpecimenType
);

// Tests
catalogRouter.get(
  '/tests',
  authorize('catalog:read'),
  validateQuery(CatalogSearchQuerySchema),
  CatalogController.searchTests
);

catalogRouter.get(
  '/tests/:id',
  authorize('catalog:read'),
  CatalogController.getTestById
);

catalogRouter.post(
  '/tests',
  authorize('catalog:write'),
  validateBody(CreateTestCatalogItemSchema),
  auditLog('CREATE_TEST', 'test'),
  CatalogController.createTest
);

catalogRouter.put(
  '/tests/:id',
  authorize('catalog:write'),
  validateBody(UpdateTestCatalogItemSchema),
  auditLog('UPDATE_TEST', 'test'),
  CatalogController.updateTest
);

// Panels
catalogRouter.get(
  '/panels',
  authorize('catalog:read'),
  CatalogController.listPanels
);

catalogRouter.post(
  '/panels',
  authorize('catalog:write'),
  validateBody(CreatePanelSchema),
  auditLog('CREATE_PANEL', 'panel'),
  CatalogController.createPanel
);
