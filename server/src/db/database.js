import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/vehicles.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export async function initDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      mileage INTEGER NOT NULL,
      fuel TEXT NOT NULL CHECK(fuel IN ('Gasolina', 'Flex', 'Diesel', 'Elétrico', 'Híbrido')),
      transmission TEXT NOT NULL CHECK(transmission IN ('Manual', 'Automático', 'CVT')),
      color TEXT NOT NULL,
      doors INTEGER NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicle_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicle_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id TEXT NOT NULL,
      feature TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      vehicles_added INTEGER DEFAULT 0,
      vehicles_updated INTEGER DEFAULT 0,
      vehicles_removed INTEGER DEFAULT 0,
      total_vehicles INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('success', 'error')),
      error_message TEXT,
      duration_ms INTEGER
    );

    CREATE TABLE IF NOT EXISTS site_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      xml_url TEXT,
      last_sync DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
    CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
    CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
    CREATE INDEX IF NOT EXISTS idx_vehicles_fuel ON vehicles(fuel);
    CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle_id ON vehicle_features(vehicle_id);
  `);

  console.log('✅ Database tables created/verified');
  return db;
}

export function getDatabase() {
  return db;
}
