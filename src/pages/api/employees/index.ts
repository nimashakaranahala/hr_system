import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import bcrypt from 'bcryptjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM employees ORDER BY id ASC');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, email, position, department, salary, photo, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const { rows } = await db.query(
        `INSERT INTO employees (name, email, position, department, salary, photo, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, email, position, department, salary, photo || null, hashedPassword]
      );
      return res.status(201).json(rows[0]);
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ error: 'Error creating employee' });
    }
  }

  res.status(405).end();
}

export default requireAuth(handler, ['ADMIN']);
