import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

interface AdminTokenPayload {
  admin_id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Token tidak tersedia' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || decoded.role !== 'admin') {
      res.status(403).json({ message: 'Token tidak valid atau bukan Admin' });
      return;
    }

    req.admin = {
      admin_id: decoded.admin_id,
      role: decoded.role
    };

    next();
  });
};

export default authenticateAdmin;
