import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';
import type { JwtPayload } from 'jsonwebtoken';

interface MyJwtPayload extends JwtPayload {
  role: string;
}

export function requireAuth(handler: Function, roles: string[] = []) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization' });

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user) return res.status(401).json({ error: 'Invalid token' });


    if (typeof user === 'string') {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    (req as any).user = user;
    return handler(req, res);
  };
}
