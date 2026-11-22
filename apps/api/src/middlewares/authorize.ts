import { Request, Response, NextFunction } from 'express';
import { Permission } from '@lab/contracts';

export function authorize(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const userPermissions = new Set(req.user.permissions || []);
    const hasPermission = requiredPermissions.every(perm => userPermissions.has(perm));

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions for this operation'
      });
    }

    next();
  };
}
