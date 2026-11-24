import pg from 'pg';
import { pool } from './client.js';

const { Client } = pg;

async function ensureDatabaseExists() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/lab_db';
  const url = new URL(connectionString);
  const targetDbName = url.pathname.replace(/^\//, '');

  if (!targetDbName || targetDbName === 'postgres') return;

  // Connect to default 'postgres' database to check/create target database
  const maintenanceUrl = new URL(connectionString);
  maintenanceUrl.pathname = '/postgres';

  const client = new Client({ connectionString: maintenanceUrl.toString() });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${targetDbName}" does not exist. Creating it now...`);
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully!`);
    }
  } catch (err: any) {
    console.warn(`[Notice] Could not verify database existence automatically (${err.message}). Proceeding...`);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function runMigrations() {
  await ensureDatabaseExists();

  console.log('Running database table creation migrations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Number Counters
    await client.query(`
      CREATE TABLE IF NOT EXISTS number_counters (
        kind VARCHAR(30) NOT NULL,
        period VARCHAR(30) NOT NULL DEFAULT 'all',
        next_value BIGINT NOT NULL DEFAULT 1,
        PRIMARY KEY (kind, period)
      );
    `);

    // 3. Lab Profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS lab_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        tagline VARCHAR(150),
        logo_url TEXT,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(100),
        address VARCHAR(255) NOT NULL,
        city VARCHAR(50) NOT NULL,
        country VARCHAR(50) NOT NULL DEFAULT 'Pakistan',
        timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Karachi',
        currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
        report_header TEXT,
        report_footer TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Staff & RBAC
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(30),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS staff_roles (
        staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (staff_id, role_id)
      );
    `);

    // 5. Patients
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        mrn VARCHAR(30) NOT NULL UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        date_of_birth DATE,
        age_years INT,
        age_months INT,
        age_days INT,
        phone VARCHAR(25) NOT NULL,
        email VARCHAR(100),
        address VARCHAR(255),
        cnic_or_id VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
    `);

    // 6. Specimen Types & Catalog
    await client.query(`
      CREATE TABLE IF NOT EXISTS specimen_types (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        department VARCHAR(50) NOT NULL,
        sample_type VARCHAR(50) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        turnaround_hours INT NOT NULL DEFAULT 24,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS test_parameters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(30),
        result_type VARCHAR(20) NOT NULL DEFAULT 'numeric',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reference_ranges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parameter_id UUID NOT NULL REFERENCES test_parameters(id) ON DELETE CASCADE,
        gender VARCHAR(20) NOT NULL DEFAULT 'all',
        min_age_years INT,
        max_age_years INT,
        normal_low NUMERIC(10, 2),
        normal_high NUMERIC(10, 2),
        critical_low NUMERIC(10, 2),
        critical_high NUMERIC(10, 2),
        normal_text TEXT
      );

      CREATE TABLE IF NOT EXISTS panels (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS panel_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (panel_id, test_id)
      );
    `);

    // 7. Orders & Items
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(30) NOT NULL UNIQUE,
        patient_id UUID NOT NULL REFERENCES patients(id),
        patient_snapshot JSONB,
        created_by UUID NOT NULL REFERENCES staff_members(id),
        status VARCHAR(30) NOT NULL DEFAULT 'pending_sample',
        referring_doctor VARCHAR(100),
        clinical_notes TEXT,
        total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        cancelled_at TIMESTAMPTZ,
        cancellation_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        test_id UUID NOT NULL REFERENCES tests(id),
        panel_id UUID REFERENCES panels(id) ON DELETE SET NULL,
        test_code VARCHAR(30),
        test_name VARCHAR(150),
        sample_type VARCHAR(50),
        price_at_order NUMERIC(10, 2) NOT NULL,
        parameters_snapshot JSONB,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Samples & Events
    await client.query(`
      CREATE TABLE IF NOT EXISTS samples (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        barcode VARCHAR(40) NOT NULL UNIQUE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        sample_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        collected_by UUID REFERENCES staff_members(id),
        collected_at TIMESTAMPTZ,
        received_by UUID REFERENCES staff_members(id),
        received_at TIMESTAMPTZ,
        rejection_reason VARCHAR(100),
        rejection_notes TEXT,
        replaces_sample_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sample_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sample_id UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
        order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (sample_id, order_item_id)
      );

      CREATE TABLE IF NOT EXISTS sample_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sample_id UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
        from_status VARCHAR(30),
        to_status VARCHAR(30) NOT NULL,
        actor_id UUID REFERENCES staff_members(id),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Column upgrades for existing databases
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS patient_snapshot JSONB;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS panel_id UUID REFERENCES panels(id) ON DELETE SET NULL;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS test_code VARCHAR(30);
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS test_name VARCHAR(150);
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sample_type VARCHAR(50);
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS parameters_snapshot JSONB;
      ALTER TABLE samples ADD COLUMN IF NOT EXISTS received_by UUID REFERENCES staff_members(id);
      ALTER TABLE samples ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
      ALTER TABLE samples ADD COLUMN IF NOT EXISTS replaces_sample_id UUID;
      ALTER TABLE samples ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    // 9. Invoices & Payments (v0.4 preview)
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_number VARCHAR(30) NOT NULL UNIQUE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        total_amount NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        net_amount NUMERIC(10, 2) NOT NULL,
        paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        balance_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
        reference_number VARCHAR(50),
        received_by UUID NOT NULL REFERENCES staff_members(id),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 10. Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id UUID REFERENCES staff_members(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50),
        details JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables successfully created!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes('migrate')) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
