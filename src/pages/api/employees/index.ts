import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM employees ORDER BY id ASC');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, email, position, department, salary, photo } = req.body;
    try {
      const { rows } = await db.query(
        `INSERT INTO employees (name, email, position, department, salary, photo)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, email, position, department, salary, photo || null]
      );
      return res.status(201).json(rows[0]);
    } catch {
      return res.status(400).json({ error: 'Error creating employee' });
    }
  }

  res.status(405).end();
}

export default requireAuth(handler, ['ADMIN']);
