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

    // 2. Lab Profiles
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

    // 3. Staff & RBAC
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

    // 4. Patients
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

    // 5. Test Catalog
    await client.query(`
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
    `);

    // 6. Orders & Samples
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(30) NOT NULL UNIQUE,
        patient_id UUID NOT NULL REFERENCES patients(id),
        created_by UUID NOT NULL REFERENCES staff_members(id),
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        referring_doctor VARCHAR(100),
        clinical_notes TEXT,
        total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        test_id UUID NOT NULL REFERENCES tests(id),
        price_at_order NUMERIC(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS samples (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        barcode VARCHAR(30) NOT NULL UNIQUE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        sample_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_collection',
        collected_by UUID REFERENCES staff_members(id),
        collected_at TIMESTAMPTZ,
        rejection_reason VARCHAR(100),
        rejection_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 7. Test Results
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        parameter_id UUID NOT NULL REFERENCES test_parameters(id),
        value TEXT NOT NULL,
        flag VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        entered_by UUID NOT NULL REFERENCES staff_members(id),
        verified_by UUID REFERENCES staff_members(id),
        verified_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Invoices & Payments
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

    // 9. Audit Logs
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
