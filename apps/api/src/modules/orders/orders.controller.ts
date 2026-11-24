import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service.js';

export class OrdersController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const order = await OrdersService.createOrder(req.body, userId);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrdersService.searchOrders(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrdersService.getOrderById(req.params.id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const order = await OrdersService.cancelOrder(req.params.id, req.body, userId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
}
