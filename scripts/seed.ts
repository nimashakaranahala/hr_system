import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  // Create tables if not exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      salary NUMERIC NOT NULL,
      photo TEXT
    );
  `);

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  // Insert users (avoid duplicates with ON CONFLICT)
  await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES 
      ('Admin User', 'admin@company.com', $1, 'ADMIN'),
      ('Employee User', 'employee@company.com', $2, 'EMPLOYEE')
    ON CONFLICT (email) DO NOTHING;
    `,
    [adminPassword, employeePassword]
  );

  // Insert some employees
  await pool.query(
    `
    INSERT INTO employees (name, email, position, department, salary, photo)
    VALUES 
      ('Alice Johnson', 'alice@company.com', 'Developer', 'Engineering', 70000, NULL),
      ('Bob Smith', 'bob@company.com', 'Designer', 'Design', 65000, NULL)
    ON CONFLICT (email) DO NOTHING;
    `
  );

  console.log('Database seeded successfully');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
