import { Request, Response, NextFunction } from 'express';
import { LabService } from './lab.service.js';

export class LabController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await LabService.getProfile();
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await LabService.updateProfile(req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}
