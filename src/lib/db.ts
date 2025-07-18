import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
