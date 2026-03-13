import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { signAuthToken } from '../auth/jwt';
import { getDb } from '../db/database';
import {
  requireAuth,
  AuthenticatedRequest,
  AuthorizedRequest,
} from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

const formatValidationErrors = (error: z.ZodError) => {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form';
    const label =
      key === '_form'
        ? 'Request body'
        : `${key[0].toUpperCase()}${key.slice(1)}`;

    let message = issue.message;

    if (issue.code === 'invalid_type') {
      if (key === '_form') {
        message = 'Request body must be a JSON object';
      } else {
        message = `${label} is required`;
      }
    }

    if (!details[key]) {
      details[key] = [];
    }

    if (!details[key].includes(message)) {
      details[key].push(message);
    }
  }

  return details;
};

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: formatValidationErrors(parsed.error),
    });
    return;
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const db = await getDb();
  const existingUser = db.data.users.find(
    (user) => user.email === normalizedEmail,
  );

  if (existingUser) {
    res.status(409).json({ message: 'Email is already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
    role: 'user' as const,
  };

  db.data.users.push(user);
  await db.write();

  const token = signAuthToken({ userId: user.id, role: user.role });

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: formatValidationErrors(parsed.error),
    });
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const db = await getDb();
  const user = db.data.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signAuthToken({ userId: user.id, role: user.role ?? 'user' });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'user',
      createdAt: user.createdAt,
    },
  });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { userId } = req as AuthorizedRequest;
  const db = await getDb();
  const user = db.data.users.find((item) => item.id === userId);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'user',
      createdAt: user.createdAt,
    },
  });
});

export default router;
