import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { StaffUser } from '@lab/contracts';

declare global {
  namespace Express {
    interface Request {
      user?: StaffUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as StaffUser;
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}
