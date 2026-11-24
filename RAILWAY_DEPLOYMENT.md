# Railway Deployment Guide — Bakka Farm Management System

This guide outlines how to deploy the **Bakka Farm Management System** backend and PostgreSQL database to [Railway](https://railway.app), while keeping your existing frontend running on [Vercel](https://vercel.com).

---

## 1. Architecture Overview

```text
┌────────────────────────┐         REST API calls         ┌─────────────────────────┐
│     Vercel (Web)       │ ─────────────────────────────> │      Railway (API)      │
│  Next.js 14 Dashboard  │   (NEXT_PUBLIC_API_URL)        │   Express.js + Prisma   │
└────────────────────────┘                                └────────────┬────────────┘
                                                                       │ SQL
                                                                       ▼
                                                          ┌─────────────────────────┐
                                                          │   Railway PostgreSQL    │
                                                          │   (or Neon Serverless)  │
                                                          └─────────────────────────┘
```

---

## 2. Required Environment Variables

When creating the services on Railway and Vercel, configure these exact environment variables:

### A. Railway Backend Service
| Variable Name | Required | Example / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Injected automatically by Railway (defaults to 4000 locally) |
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` (Reference from Railway Postgres plugin) or Neon URL |
| `SESSION_SECRET` | Yes | A random 64-character secret string for JWT and session tokens |
| `APP_ORIGIN` | Yes | `https://test-app-ashy-phi.vercel.app` (Your frontend URL for CORS) |
| `OFFLINE_SESSION_MAX_DAYS` | No | `7` |
| `BOOTSTRAP_ADMIN_EMAIL` | Yes | `admin@bakkafarm.com` |
| `BOOTSTRAP_ADMIN_PASSWORD` | Yes | Your secure admin password |
| `BOOTSTRAP_ADMIN_NAME` | No | `Bakka Farm Administrator` |

### B. Vercel Frontend Service
| Variable Name | Required | Example / Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | `https://your-api-service.up.railway.app/api` |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Create a Railway Project
1. Log in to [Railway](https://railway.app).
2. Click **New Project** -> **Provision PostgreSQL**.
   - This creates your cloud PostgreSQL instance.
   - Railway generates a connection string accessible as `${{Postgres.DATABASE_URL}}`.

### Step 2: Deploy the API Service
1. In the same Railway project, click **+ New** -> **GitHub Repo**.
2. Select your repository: `bukhaari00/test-app`.
3. In Railway service **Settings**:
   - **Root Directory**: Leave as `/` (monorepo root) or set to `apps/api`.
   - **Build Command**: `npm install && npm --workspace=apps/api run build`
   - **Start Command**: `node apps/api/src/server.js`
   - **Healthcheck Path**: `/health` (or `/api/health`)
4. In Railway service **Variables**:
   - Add `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (or select from references).
   - Add `NODE_ENV` = `production`.
   - Add `SESSION_SECRET` = `<random-secure-string>`.
   - Add `APP_ORIGIN` = `https://test-app-ashy-phi.vercel.app`.
   - Add `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`.

### Step 3: Initialize Database Tables & Seed
Once the Railway service builds:
Open the Railway service **CLI / Query Console** or run from your local terminal with Railway connection string:
```bash
# Push schema and tables to PostgreSQL
npm run db:push

# Seed initial farm, roles, and default admin
npm run db:seed
```

### Step 4: Generate a Public Domain for API
1. In the Railway API service settings, go to **Networking** -> **Public Networking**.
2. Click **Generate Domain** (e.g. `bakka-api-production.up.railway.app`).

### Step 5: Connect Vercel to Railway
1. Go to your [Vercel Dashboard](https://vercel.com).
2. Open project `test-app` -> **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://bakka-api-production.up.railway.app/api`
4. Redeploy the Vercel frontend. Now your Vercel frontend communicates directly with the Railway backend!

---

## 4. Health Check Endpoint

Railway will periodically probe:
- `GET /health` or `GET /api/health`
- Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "system": "Bakka Farm Management API",
    "environment": "production",
    "timestamp": "2026-11-24T05:30:00.000Z"
  }
}
```
If the database drops connection, it returns HTTP 503 (`status: "degraded"`), allowing Railway to auto-restart the container.
