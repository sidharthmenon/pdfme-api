import Fastify from 'fastify';
import dotenv from 'dotenv';
import rateLimit from '@fastify/rate-limit';
import pdfRoutes from './pdf.js';
import path from 'path';
import { fileURLToPath } from 'url';
import staticPlugin from '@fastify/static';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true, bodyLimit: 5 * 1024 });

app.register(rateLimit, {
  max: Number(process.env.RATE_LIMIT_MAX || 30),
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || '1 minute'
});

app.register(pdfRoutes, { prefix: '/' });

app.get('/health', async () => ({ status: 'ok' }));

app.listen({
  port: process.env.PORT || 3000,
  host: '0.0.0.0'
});
