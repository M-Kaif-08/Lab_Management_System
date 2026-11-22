import { Request, Response, NextFunction } from 'express';
import { db, auditLogs } from '@lab/db';

export function auditLog(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Asynchronously record audit log without blocking response
        db.insert(auditLogs).values({
          staffId: req.user?.id,
          action,
          entityType,
          entityId: req.params.id || body?.id || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            params: req.params
          },
          ipAddress: req.ip || req.socket.remoteAddress
        }).catch(err => console.error('[AuditLog Error]', err));
      }
      return originalSend.call(this, body);
    };

    next();
  };
}
