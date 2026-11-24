import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { auditLog } from '../../middlewares/auditLogger.js';
import { CreateOrderSchema, OrderSearchQuerySchema, CancelOrderSchema } from '@lab/contracts';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.get(
  '/',
  authorize('order:read'),
  validateQuery(OrderSearchQuerySchema),
  OrdersController.search
);

ordersRouter.post(
  '/',
  authorize('order:create'),
  validateBody(CreateOrderSchema),
  auditLog('CREATE_ORDER', 'order'),
  OrdersController.create
);

ordersRouter.get(
  '/:id',
  authorize('order:read'),
  OrdersController.getById
);

ordersRouter.post(
  '/:id/cancel',
  authorize('order:create'),
  validateBody(CancelOrderSchema),
  auditLog('CANCEL_ORDER', 'order'),
  OrdersController.cancel
);
