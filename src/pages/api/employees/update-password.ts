import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

const SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password too short' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await db.query('UPDATE employees SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);
    res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating password' });
  }
}
