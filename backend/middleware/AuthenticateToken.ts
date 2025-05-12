import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token tidak tersedia' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded: any) => {
  if (err) {
    res.status(403).json({ error: 'Token tidak valid' });
    return;
  }

  console.log('Decoded JWT:', decoded); // Pastikan decoded berisi nasabah_id
  req.body.nasabah_id = decoded.nasabah_id;
  next();
});

};

export default authenticateToken;
