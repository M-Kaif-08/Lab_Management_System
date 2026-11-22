import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { LoginRequestSchema } from '@lab/contracts';

export const authRouter = Router();

authRouter.post('/login', validateBody(LoginRequestSchema), AuthController.login);
authRouter.get('/me', authenticate, AuthController.me);
