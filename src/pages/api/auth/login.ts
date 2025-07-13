import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET_KEY = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // First check in 'users' table (for admin or other roles)
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1d' }
      );

      return res.status(200).json({ token, role: user.role });
    }

    // Then check in 'employees' table
    const empResult = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);

    if (empResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const employee = empResult.rows[0];
    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: 'EMPLOYEE' },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token, role: 'EMPLOYEE' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
