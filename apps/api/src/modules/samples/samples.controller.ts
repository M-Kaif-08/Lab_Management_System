import { Request, Response, NextFunction } from 'express';
import { SamplesService } from './samples.service.js';

export class SamplesController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SamplesService.searchSamples(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const sample = await SamplesService.getById(req.params.id);
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  static async collect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const sample = await SamplesService.collect(req.params.id, req.body.notes, userId);
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  static async receive(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const sample = await SamplesService.receive(req.params.id, req.body.notes, userId);
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  static async process(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const sample = await SamplesService.process(req.params.id, req.body.notes, userId);
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const sample = await SamplesService.reject(req.params.id, req.body, userId);
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  static async recollect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const sample = await SamplesService.recollect(req.params.id, req.body, userId);
      res.status(201).json(sample);
    } catch (error) {
      next(error);
    }
  }
}
