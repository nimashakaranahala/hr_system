import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, email, position, department, salary, photo } = req.body;
    try {
      const { rows } = await db.query(
        `UPDATE employees SET name=$1, email=$2, position=$3, department=$4, salary=$5, photo=$6 WHERE id=$7 RETURNING *`,
        [name, email, position, department, salary, photo || null, id]
      );
      return res.status(200).json(rows[0]);
    } catch {
      return res.status(400).json({ error: 'Error updating employee' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM employees WHERE id=$1', [id]);
      return res.status(204).end();
    } catch {
      return res.status(400).json({ error: 'Error deleting employee' });
    }
  }

  res.status(405).end();
}

export default requireAuth(handler, ['ADMIN']);
