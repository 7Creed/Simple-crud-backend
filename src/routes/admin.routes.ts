import { Router } from 'express';
import { getDb } from '../db/database';
import {
  requireAdmin,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

const router = Router();

router.get('/users', requireAdmin, async (_req: AuthenticatedRequest, res) => {
  const db = await getDb();
  const users = db.data.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? 'user',
    createdAt: user.createdAt,
  }));

  res.status(200).json({ users });
});

export default router;
