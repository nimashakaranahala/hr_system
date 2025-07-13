import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

  const form = formidable({ uploadDir: './public/uploads', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.photo) {
      return res.status(400).json({ message: 'File upload error' });
    }

    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
    const relativePath = '/uploads/' + path.basename(photoFile.filepath);

    try {
      await db.query('UPDATE employees SET photo = $1 WHERE id = $2', [relativePath, decoded.id]);
      res.status(200).json({ message: 'Photo updated', photo: relativePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating photo' });
    }
  });
}
