import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';
import authRoutes from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

// Load environment variables
dotenv.config();

const app = express();
const logger = pino();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(pinoHttp({ logger }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Placeholder for mounting other routes
// app.use('/api/partners', partnerRoutes);
// ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`GroChain backend running on port ${PORT}`);
});
