import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token tidak tersedia' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Token tidak valid' });
      return;
    }
    req.user = {
      id: decoded.nasabah_id
    };

    next();
  });
};

export default authenticateToken;
