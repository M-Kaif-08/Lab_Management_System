import { Request, Response, NextFunction } from 'express';
import { CatalogService } from './catalog.service.js';

export class CatalogController {
  static async listSpecimenTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await CatalogService.listSpecimenTypes();
      res.json(types);
    } catch (error) {
      next(error);
    }
  }

  static async createSpecimenType(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await CatalogService.createSpecimenType(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  static async searchTests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CatalogService.searchTests(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTestById(req: Request, res: Response, next: NextFunction) {
    try {
      const test = await CatalogService.getTestById(req.params.id);
      res.json(test);
    } catch (error) {
      next(error);
    }
  }

  static async createTest(req: Request, res: Response, next: NextFunction) {
    try {
      const test = await CatalogService.createTest(req.body);
      res.status(201).json(test);
    } catch (error) {
      next(error);
    }
  }

  static async updateTest(req: Request, res: Response, next: NextFunction) {
    try {
      const test = await CatalogService.updateTest(req.params.id, req.body);
      res.json(test);
    } catch (error) {
      next(error);
    }
  }

  static async listPanels(req: Request, res: Response, next: NextFunction) {
    try {
      const panels = await CatalogService.listPanels();
      res.json(panels);
    } catch (error) {
      next(error);
    }
  }

  static async createPanel(req: Request, res: Response, next: NextFunction) {
    try {
      const panel = await CatalogService.createPanel(req.body);
      res.status(201).json(panel);
    } catch (error) {
      next(error);
    }
  }
}
