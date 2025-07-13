import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret123123';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const email = decoded.email;

    const result = await pool.query(
      'SELECT id, name, email, position, department, salary, photo FROM employees WHERE email = $1',
      [email]
    );

    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json({ employee });
  } catch (err: any) {
    console.error('JWT verification or DB error:', err);
    return res.status(401).json({ message: 'Unauthorized or token invalid' });
  }
}
