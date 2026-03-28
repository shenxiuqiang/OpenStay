import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { testConnection, syncDatabase } from './libs/db.js';
import hubRoutes from './routes/hub.js';
import joinRequestRoutes from './routes/join-request.js';
import propertyRoutes from './routes/property.js';
import syncRoutes from './routes/sync.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3031;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'openstay-hub',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes
app.use('/api/hub', hubRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/public', publicRoutes);

// Static files (production build)
const staticPath = path.join(__dirname, '../../dist');
app.use(express.static(staticPath));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    },
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database (alter mode for development)
    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    await syncDatabase(forceSync);

    app.listen(PORT, () => {
      console.log(`🚀 OpenStay Hospitality Hub running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
