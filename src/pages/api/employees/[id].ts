import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import bcrypt from 'bcryptjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  if (req.method === 'PUT') {
    const { name, email, position, department, salary, photo, password } = req.body;

    let hashedPasswordClause = '';
    const values = [name, email, position, department, salary, photo || null];
    let paramCount = values.length;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      paramCount++;
      hashedPasswordClause = `, password = $${paramCount}`;
    }

    values.push(id);

    try {
      const { rows } = await db.query(
        `UPDATE employees
         SET name = $1,
             email = $2,
             position = $3,
             department = $4,
             salary = $5,
             photo = $6
             ${hashedPasswordClause}
         WHERE id = $${paramCount + 1}
         RETURNING *`,
        values
      );
      return res.status(200).json(rows[0]);
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ error: 'Error updating employee' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM employees WHERE id = $1', [id]);
      return res.status(204).end();
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ error: 'Error deleting employee' });
    }
  }

  res.status(405).end();
}

export default requireAuth(handler, ['ADMIN']);
