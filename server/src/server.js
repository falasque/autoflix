import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import vehicleRoutes from './routes/vehicles.js';
import syncRoutes from './routes/sync.js';
import ogRoutes from './routes/og.js';
import { startScheduledSync } from './services/sync-service.js';
import { requestLoggingMiddleware, logError } from './services/logger-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use(requestLoggingMiddleware());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  console.log(`📝 [${timestamp}] ${req.method.padEnd(6)} ${req.path}`);
  next();
});

// Initialize database
let db = null;

async function startServer() {
  try {
    // Initialize database
    db = await initDatabase();
    console.log('✅ Database initialized successfully');

    // Attach database to app for use in routes
    app.locals.db = db;

  // Routes
  // Open Graph helper for social crawlers (serves pre-rendered meta)
  app.use('/og', ogRoutes);

  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/sync', syncRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err);
      logError(err, `${req.method} ${req.path}`);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: ${process.env.DB_PATH || './data/vehicles.db'}`);
    });

    // Start scheduled sync
    startScheduledSync(db);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
