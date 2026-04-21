# Railway Production Deployment

Five services. One production story. PostgreSQL, Redis, Rails, Sidekiq, and Next.js, each with a clean role.

This guide documents the recommended Railway production setup for this repository.

## Architecture

| Service | Type | Root Directory |
| --- | --- | --- |
| PostgreSQL | Railway Plugin | — |
| Redis | Railway Plugin | — |
| Backend (Rails API) | Docker | `backend` |
| Sidekiq (Worker) | Docker | `backend` |
| Frontend (Next.js) | Docker | `frontend` |

## Before You Start

- Push the repository to GitHub.
- Create a Railway account.
- Keep these secrets ready before deployment:
  - `RAILS_MASTER_KEY`
  - `SECRET_KEY_BASE`
  - `DEVISE_SECRET_KEY`
  - `DEVISE_JWT_SECRET_KEY`

## Step 1. Create the Railway Project

1. Go to `https://railway.app`.
2. Click `New Project`.
3. Choose `Empty Project`.

## Step 2. Add Database Plugins

1. Click `+ New`.
2. Add the `PostgreSQL` plugin.
3. Add the `Redis` plugin.

Railway will provide:

- `DATABASE_URL` from PostgreSQL
- `REDIS_URL` from Redis

## Step 3. Deploy the Backend (Rails API)

1. Click `+ New`.
2. Choose `GitHub Repo`.
3. Select this repository.

Backend service settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Builder | `Dockerfile` |
| Dockerfile Path | `Dockerfile.prod` |
| Start Command | `./bin/rails server -b 0.0.0.0 -p ${PORT:-3000}` |
| Watch Paths | `backend/**` |

Use this start command on Railway because the repository currently defaults to a combined Rails + Sidekiq startup script. In the recommended 5-service production setup, the backend service should run Rails only.

Backend environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `REDIS_CABLE_URL` | `${{Redis.REDIS_URL}}` |
| `RAILS_ENV` | `production` |
| `RAILS_MASTER_KEY` | your `config/master.key` value |
| `SECRET_KEY_BASE` | generate with `rails secret` |
| `DEVISE_JWT_SECRET_KEY` | value from `backend/config/application.yml` |
| `DEVISE_SECRET_KEY` | value from `backend/config/application.yml` |
| `CORS_ORIGINS` | `https://YOUR-FRONTEND.up.railway.app` |
| `APP_HOSTS` | `.up.railway.app` |
| `PORT` | `3000` |
| `RAILS_LOG_TO_STDOUT` | `true` |

## Step 4. Deploy Sidekiq (Worker)

1. Click `+ New`.
2. Choose the same GitHub repository.

Sidekiq service settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Builder | `Dockerfile` |
| Dockerfile Path | `Dockerfile.prod` |
| Start Command | `bundle exec sidekiq -C config/sidekiq.yml` |
| Watch Paths | `backend/**` |

Sidekiq environment variables:

- Reuse the same environment variables as the backend service.
- No separate Sidekiq-specific environment list is needed.

## Step 5. Deploy the Frontend (Next.js)

1. Click `+ New`.
2. Choose the same GitHub repository.

Frontend service settings:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Builder | `Dockerfile` |
| Dockerfile Path | `Dockerfile.prod` |
| Watch Paths | `frontend/**` |

Frontend environment variables:

| Variable | Value |
| --- | --- |
| `PORT` | `3000` |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.up.railway.app` |
| `NEXT_PUBLIC_API_VERSION` | `/api/v1` |
| `NEXT_PUBLIC_ORIGIN_CABLE` | `YOUR-BACKEND.up.railway.app` |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` |

Important:

- `NEXT_PUBLIC_ORIGIN_CABLE` must be host only.
- Do not include `https://`.
- These values are build-time values for the frontend image.

## Step 6. Generate Domains

1. Generate a public domain for the backend service.
2. Generate a public domain for the frontend service.
3. Save both URLs.

Then update:

- `CORS_ORIGINS`
- `APP_HOSTS`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ORIGIN_CABLE`

## Step 7. Redeploy in Order

After the real domains are known:

1. Update backend environment variables.
2. Redeploy the backend service.
3. Update frontend environment variables.
4. Redeploy the frontend service.

## Notes That Matter

- Database preparation runs automatically for the backend service through `backend/bin/docker-entrypoint` when the backend start command is `./bin/rails server ...`.
- Sidekiq uses the same Redis connection family as the backend service.
- Secrets from `backend/config/application.yml` should be stored in Railway environment variables, not committed as production secrets.
- `backend/Dockerfile.prod` currently defaults to `./bin/start-railway-all` for quick combined-mode deploys. If you use this 5-service production setup, keep the backend start command overridden to `./bin/rails server ...` so Sidekiq only runs in the worker service.

## Files Behind The Deploy

| File | Role |
| --- | --- |
| `frontend/next.config.ts` | Enables standalone Next.js output for Docker |
| `backend/Dockerfile.prod` | Builds the Rails production image |
| `backend/bin/docker-entrypoint` | Runs `db:prepare` before Rails server boot |
| `backend/bin/start-railway-all` | Combined web + Sidekiq fallback for quick deploys |
| `backend/config/cable.yml` | Uses `REDIS_CABLE_URL` for Action Cable |
