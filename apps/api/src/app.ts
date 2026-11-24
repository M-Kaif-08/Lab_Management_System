import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { API_PREFIX } from './config/constants.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { labRouter } from './modules/lab/lab.routes.js';
import { patientsRouter } from './modules/patients/patients.routes.js';
import { catalogRouter } from './modules/catalog/catalog.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { samplesRouter } from './modules/samples/samples.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/lab`, labRouter);
app.use(`${API_PREFIX}/patients`, patientsRouter);
app.use(`${API_PREFIX}/catalog`, catalogRouter);
app.use(`${API_PREFIX}/orders`, ordersRouter);
app.use(`${API_PREFIX}/samples`, samplesRouter);
app.use(`${API_PREFIX}/audit`, auditRouter);

// Central Error Handler
app.use(errorHandler);
