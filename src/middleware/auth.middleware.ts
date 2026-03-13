import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../auth/jwt';

// Used by the middleware functions — fields are absent before the middleware runs
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: 'admin' | 'user';
}

// Used by route handlers behind requireAuth/requireAdmin — fields are guaranteed present
export interface AuthorizedRequest extends Request {
  userId: string;
  userRole: 'admin' | 'user';
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      res.status(403).json({ message: 'Forbidden: admin access required' });
      return;
    }
    next();
  });
};
