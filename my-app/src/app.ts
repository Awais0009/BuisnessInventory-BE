
// app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

import { securityHeaders, requestLogger, rateLimit } from './middlewares/common';

// Load environment variables first
dotenv.config();

const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3001;

// CORS configuration for PWA frontend
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security and common middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (more permissive for development)
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes in production
} else {
  app.use(rateLimit(5000, 15 * 60 * 1000)); // 5000 requests per 15 minutes in development
}

// Request logging
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Start server function
const startServer = async () => {
  try {
    // Test database connection if configured
    if (process.env.DB_HOST) {
      const pool = await import('./config/database');
      await pool.default.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
    } else {
      console.log('⚠️  Database not configured, running without DB connection');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit, just log the error and continue without DB
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (without database)`);
    });
  }
};

startServer();

export default app;
