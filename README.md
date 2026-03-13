# Simple CRUD Backend (Training API)

Professional, minimal Node.js + TypeScript backend with file-based database for student training.

## Features

- Register endpoint
- Login endpoint
- Protected me endpoint
- JWT authentication
- File-based database (no paid DB needed)
- Swagger UI docs at `/docs`
- Static API docs publishable on GitHub Pages
- Render-ready deployment config

## Stack

- Express + TypeScript
- lowdb (JSON file DB)
- bcryptjs + jsonwebtoken
- zod validation
- swagger-ui-express + OpenAPI 3

## API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (Bearer token required)
- `GET /health`
- `GET /docs` (interactive Swagger docs)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Run dev server:

```bash
npm run dev
```

4. Open docs:

- http://localhost:4000/docs

## Production Run

```bash
npm run build
npm start
```

## Testing and Coverage

Run test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

Coverage output:

- Terminal summary
- HTML report at `coverage/index.html`

## Render Deployment (Free)

### Option A: Blueprint deploy (recommended)

1. Push this repo to GitHub.
2. On Render, create a new Blueprint and select this repository.
3. Render reads `render.yaml` and sets service automatically.
4. Add or confirm env vars:
   - `JWT_SECRET` (required)
   - `DB_FILE_PATH=data/db.json`
5. Deploy.

### Option B: Manual web service

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Node version: 20+
- Environment variables:
  - `NODE_ENV=production`
  - `JWT_SECRET=<your-secret>`
  - `DB_FILE_PATH=data/db.json`

## Important Note About File DB on Render

Render free instances have ephemeral file storage. Data may reset after redeploy/restart.
That is acceptable for training/demo usage, but not for production.

## API Docs Access For Students

### 1) Via Render app (simplest)

- `https://your-service.onrender.com/docs`

### 2) Via GitHub Pages (free static docs)

This repo includes:

- `index.html` (Swagger UI at site root)
- `docs/index.html`
- `docs/openapi.yaml`
- GitHub Action workflow at `.github/workflows/deploy-docs.yml`

To enable (recommended: deploy from branch):

1. Push to `main`.
2. In GitHub repository `Settings -> Pages`:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

3. Students can view docs at your Pages URL, typically:
   - `https://<username>.github.io/<repo-name>/`

Alternative:

- You can also set Source to `GitHub Actions` to publish from `docs/` using `.github/workflows/deploy-docs.yml`.
- With this mode, use the same root URL above (not `/docs`).

## Example Requests

### Register

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Student One","email":"student@example.com","password":"mySecurePassword"}'
```

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"mySecurePassword"}'
```

### Me

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```
