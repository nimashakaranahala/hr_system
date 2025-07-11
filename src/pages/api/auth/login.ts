import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(200).json({ token, role: user.role });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
