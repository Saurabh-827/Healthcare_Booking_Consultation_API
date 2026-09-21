import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

// 1. Token Verify middleware
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Client Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    
    // Token verify 
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// 2. Role-Based Access Control (RBAC) middleware
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You do not have permissions to access this resource.' 
      });
      return;
    }
    next(); 
  };
};