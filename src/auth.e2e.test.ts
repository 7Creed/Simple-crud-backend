import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const tempDbFile = path.join(
  os.tmpdir(),
  `simple-crud-backend-test-${process.pid}.json`,
);

const resetTestDb = async () => {
  await fs.mkdir(path.dirname(tempDbFile), { recursive: true });
  await fs.writeFile(
    tempDbFile,
    JSON.stringify({ users: [] }, null, 2),
    'utf-8',
  );
};

describe('Auth API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.DB_FILE_PATH = tempDbFile;
  });

  beforeEach(async () => {
    await resetTestDb();
    vi.resetModules();
  });

  it('registers a new user', async () => {
    const { default: app } = await import('./app');

    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Student One',
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.user.email).toBe('student@example.com');
  });

  it('rejects duplicate registration', async () => {
    const { default: app } = await import('./app');

    await request(app).post('/api/v1/auth/register').send({
      name: 'Student One',
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Student One',
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    expect(response.status).toBe(409);
  });

  it('logs in and fetches current user profile', async () => {
    const { default: app } = await import('./app');

    await request(app).post('/api/v1/auth/register').send({
      name: 'Student One',
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTypeOf('string');

    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe('student@example.com');
  });

  it('rejects me without a token', async () => {
    const { default: app } = await import('./app');

    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Missing or invalid authorization header',
    );
  });

  it('returns readable validation errors for empty login payload', async () => {
    const { default: app } = await import('./app');

    const response = await request(app).post('/api/v1/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors.email).toContain('Email is required');
    expect(response.body.errors.password).toContain('Password is required');
  });

  it('returns readable validation errors for empty register payload', async () => {
    const { default: app } = await import('./app');

    const response = await request(app).post('/api/v1/auth/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors.name).toContain('Name is required');
    expect(response.body.errors.email).toContain('Email is required');
    expect(response.body.errors.password).toContain('Password is required');
  });

  it('rejects login with wrong password using readable message', async () => {
    const { default: app } = await import('./app');

    await request(app).post('/api/v1/auth/register').send({
      name: 'Student One',
      email: 'student@example.com',
      password: 'mySecurePassword',
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'student@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
