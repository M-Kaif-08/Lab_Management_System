import { Request, Response, NextFunction } from 'express';
import { PatientsService } from './patients.service.js';

export class PatientsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientsService.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PatientsService.search(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientsService.getById(req.params.id);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientsService.update(req.params.id, req.body);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
}
