import express from 'express';
import { cacheService } from '../services/cache-service.js';

const router = express.Router();

// TTL in milliseconds (4 hours)
const CACHE_TTL = 4 * 60 * 60 * 1000;

// GET all vehicles with filters
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const {
      page = 1,
      limit = 20,
      brand,
      year,
      fuel,
      priceMin,
      priceMax,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const cacheKey = `vehicles:list:${page}:${limit}:${brand || 'all'}:${year || 'all'}:${fuel || 'all'}:${priceMin || 'all'}:${priceMax || 'all'}:${search || 'all'}:${sort}:${order}`;

    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;
    const validSortFields = ['id', 'name', 'price', 'year', 'mileage', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (brand) {
      query += ' AND brand = ?';
      params.push(brand);
    }

    if (year) {
      query += ' AND year = ?';
      params.push(parseInt(year, 10));
    }

    if (fuel) {
      query += ' AND fuel = ?';
      params.push(fuel);
    }

    if (priceMin) {
      query += ' AND price >= ?';
      params.push(parseFloat(priceMin));
    }

    if (priceMax) {
      query += ' AND price <= ?';
      params.push(parseFloat(priceMax));
    }

    if (search) {
      query += ' AND (name LIKE ? OR brand LIKE ? OR model LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await db.get(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    );
    const total = countResult.count;

    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limitNumber, offset);

    const vehicles = await db.all(query, params);

    const vehiclesWithDetails = await Promise.all(
      vehicles.map(async (vehicle) => {
        const images = await db.all(
          'SELECT image_url FROM vehicle_images WHERE vehicle_id = ? ORDER BY position',
          [vehicle.id]
        );
        const features = await db.all(
          'SELECT feature FROM vehicle_features WHERE vehicle_id = ?',
          [vehicle.id]
        );

        return {
          ...vehicle,
          images: images.map(img => img.image_url),
          features: features.map(feat => feat.feature),
          featured: Boolean(vehicle.featured)
        };
      })
    );

    const result = {
      data: vehiclesWithDetails,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    };

    cacheService.set(cacheKey, result, CACHE_TTL);

    res.json(result);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Static sub-routes must stay before /:identifier.
router.get('/filters/options', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const cacheKey = 'vehicles:filters:options';
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const brands = await db.all('SELECT DISTINCT brand FROM vehicles ORDER BY brand');
    const years = await db.all('SELECT DISTINCT year FROM vehicles ORDER BY year DESC');
    const fuels = await db.all('SELECT DISTINCT fuel FROM vehicles ORDER BY fuel');
    const prices = await db.get('SELECT MIN(price) as min, MAX(price) as max FROM vehicles');

    const result = {
      brands: brands.map(b => b.brand),
      years: years.map(y => y.year),
      fuels: fuels.map(f => f.fuel),
      priceRange: {
        min: prices?.min || 0,
        max: prices?.max || 0
      }
    };

    cacheService.set(cacheKey, result, CACHE_TTL);

    res.json(result);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const cacheKey = 'vehicles:stats:overview';
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const stats = await db.get(`
      SELECT
        COUNT(*) as total_vehicles,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(year) as avg_year
      FROM vehicles
    `);

    cacheService.set(cacheKey, stats, CACHE_TTL);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single vehicle by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { identifier } = req.params;

    const vehicle = await db.get(
      'SELECT * FROM vehicles WHERE id = ? OR slug = ?',
      [identifier, identifier]
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const images = await db.all(
      'SELECT image_url FROM vehicle_images WHERE vehicle_id = ? ORDER BY position',
      [vehicle.id]
    );
    const features = await db.all(
      'SELECT feature FROM vehicle_features WHERE vehicle_id = ?',
      [vehicle.id]
    );

    res.json({
      ...vehicle,
      images: images.map(img => img.image_url),
      features: features.map(feat => feat.feature),
      featured: Boolean(vehicle.featured)
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
