import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashed = await hashPassword(password);
    await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      [email, hashed, role.toUpperCase()]
    );
    return res.status(201).json({ message: 'User created' });
  } catch (error: any) {
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
