import express from 'express';
import { syncVehiclesFromXml } from '../services/sync-service.js';
import { generateSitemap } from '../scripts/generate-sitemap.js';
import { cacheService } from '../services/cache-service.js';
import { getLogTail, getLogStats, clearLog } from '../services/logger-service.js';

const router = express.Router();

// POST: Trigger manual sync
router.post('/trigger', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const xmlUrl = process.env.XML_URL;

    if (!xmlUrl) {
      return res.status(400).json({ error: 'XML_URL not configured' });
    }

    const result = await syncVehiclesFromXml(db, xmlUrl);

    res.json({
      success: true,
      message: 'Sync completed successfully',
      result
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Last sync info
router.get('/info', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const lastSync = await db.get(
      'SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT 1'
    );

    const totalVehicles = await db.get('SELECT COUNT(*) as count FROM vehicles');

    res.json({
      lastSync,
      totalVehicles: totalVehicles?.count || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching sync info:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Sync history
router.get('/history', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const history = await db.all(
      'SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT ?',
      [limit]
    );

    res.json(history);

  } catch (error) {
    console.error('❌ Error fetching sync history:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Generate sitemap manually
router.post('/generate-sitemap', async (req, res) => {
  try {
    console.log('🗺️  Gerando sitemap manualmente via API...');
    const result = await generateSitemap();

    res.json({
      success: true,
      message: 'Sitemap generated successfully',
      result
    });

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Generate sitemap manually (alternativa com GET)
router.get('/generate-sitemap', async (req, res) => {
  try {
    console.log('🗺️  Gerando sitemap manualmente via API (GET)...');
    const result = await generateSitemap();

    res.json({
      success: true,
      message: 'Sitemap generated successfully',
      result
    });

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({
      success: true,
      message: 'Cache statistics',
      stats
    });
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Clear all cache
router.post('/cache/clear', async (req, res) => {
  try {
    cacheService.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Invalidate vehicle cache
router.post('/cache/invalidate-vehicles', async (req, res) => {
  try {
    cacheService.invalidateVehicleCache();
    res.json({
      success: true,
      message: 'Vehicle cache invalidated successfully'
    });
  } catch (error) {
    console.error('❌ Error invalidating vehicle cache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────
// LOGGING ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET: Log statistics
router.get('/logs/stats', (req, res) => {
  try {
    const stats = getLogStats();
    res.json({
      success: true,
      message: 'Log statistics',
      stats,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  } catch (error) {
    console.error('❌ Error getting log stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: API requests log (últimas N linhas)
router.get('/logs/api', (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 50;
    const content = getLogTail('api-requests', lines);
    
    res.json({
      success: true,
      filename: 'api-requests.log',
      lines,
      content,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  } catch (error) {
    console.error('❌ Error reading API logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Error logs (últimas N linhas)
router.get('/logs/errors', (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 50;
    const content = getLogTail('errors', lines);
    
    res.json({
      success: true,
      filename: 'errors.log',
      lines,
      content,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  } catch (error) {
    console.error('❌ Error reading error logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Cron execution logs (últimas N linhas)
router.get('/logs/cron', (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 50;
    const content = getLogTail('cron-executions', lines);
    
    res.json({
      success: true,
      filename: 'cron-executions.log',
      lines,
      content,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  } catch (error) {
    console.error('❌ Error reading cron logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Clear specific log file
router.post('/logs/clear/:type', (req, res) => {
  try {
    const type = req.params.type; // 'api', 'errors', 'cron'
    const validTypes = ['api-requests', 'errors', 'cron-executions'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid log type. Valid types: ${validTypes.join(', ')}`
      });
    }

    const message = clearLog(type);
    
    res.json({
      success: true,
      message,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  } catch (error) {
    console.error('❌ Error clearing log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Combined system status dashboard
router.get('/status', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get last sync info
    const lastSync = await db.get(
      'SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT 1'
    );

    // Get total vehicles
    const totalVehicles = await db.get('SELECT COUNT(*) as count FROM vehicles');

    // Get cache stats
    const cacheStats = cacheService.getStats();

    // Get log stats
    const logStats = getLogStats();

    res.json({
      success: true,
      system: {
        timestamp: new Date().toLocaleString('pt-BR'),
        status: 'operational'
      },
      database: {
        totalVehicles: totalVehicles?.count || 0,
        lastSync: lastSync ? {
          date: lastSync.sync_date,
          added: lastSync.vehicles_added,
          updated: lastSync.vehicles_updated,
          removed: lastSync.vehicles_removed,
          durationMs: lastSync.duration_ms
        } : null
      },
      cache: cacheStats,
      logs: logStats
    });

  } catch (error) {
    console.error('❌ Error getting system status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
