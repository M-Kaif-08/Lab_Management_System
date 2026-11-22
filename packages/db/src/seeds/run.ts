import { runMigrations } from '../migrate.js';
import { seedInitialAdmin } from './01_initial_admin.js';
import { seedDemoCatalog } from './02_demo_catalog.js';
import { pool } from '../client.js';

async function main() {
  try {
    console.log('--- Initializing Lab Management Database ---');
    await runMigrations();
    await seedInitialAdmin();
    await seedDemoCatalog();
    console.log('--- Database Setup & Seeding Completed Successfully! ---');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
