import { Request, Response, NextFunction } from 'express';
import { db, auditLogs } from '@lab/db';
import { desc, count } from 'drizzle-orm';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await db.select({ total: count() }).from(auditLogs);

      res.json({
        items,
        total: Number(totalResult?.total || 0),
        page,
        limit
      });
    } catch (error) {
      next(error);
    }
  }
}
