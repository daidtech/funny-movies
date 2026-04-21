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

## Step 3. Deploy the Backend (Rails API + Sidekiq)

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
| `RAILS_MASTER_KEY` | generate with `rails credentials:edit` or `rails credentials:generate` |
| `SECRET_KEY_BASE` | generate with `rails secret` |
| `DEVISE_JWT_SECRET_KEY` | generate with `rails secret` |
| `DEVISE_SECRET_KEY` | generate with `rails secret` |
| `CORS_ORIGINS` | `https://<Your frontend domain>` |
| `PORT` | `3000` |
| `RAILS_LOG_TO_STDOUT` | `true` |

## Step 4. Deploy the Frontend (Next.js)

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
| `NEXT_PUBLIC_API_URL` | `https://<YOUR-BACKEND>` |
| `NEXT_PUBLIC_API_VERSION` | `/api/v1` |
| `NEXT_PUBLIC_ORIGIN_CABLE` | `<YOUR-BACKEND>` |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` |

Important:

- `NEXT_PUBLIC_ORIGIN_CABLE` must be host only.
- Do not include `https://`.
- These values are build-time values for the frontend image.

## Step 5. Generate Domains

1. Generate a public domain for the backend service.
2. Generate a public domain for the frontend service.
3. Save both URLs.

Then update:

- `CORS_ORIGINS`
- `APP_HOSTS`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ORIGIN_CABLE`

## Step 6. Redeploy in Order

After the real domains are known:

1. Update backend environment variables.
2. Redeploy the backend service.
3. Update frontend environment variables.
4. Redeploy the frontend service.

## Notes That Matter

- After the first deploy, add the necessary environment variables to the backend and run `bundle exec rails db:create db:migrate`.
- Sidekiq uses the same Redis connection as the backend service.
- `backend/Dockerfile.prod` currently defaults to running both the Rails server and Sidekiq together (using `./bin/start-railway-all`) for quick testing or simple deployments.
- **For real production:** You should run the Rails server and Sidekiq as separate services/containers. Set the backend start command to `./bin/rails server ...` so only the Rails API runs in the backend service, and run Sidekiq in its own worker service.

## Files Behind The Deploy

| File | Role |
| --- | --- |
| `backend/Dockerfile.prod` | Builds the Rails production image |
| `backend/bin/start-railway-all` | Combined web + Sidekiq fallback for quick deploys |
| `backend/config/cable.yml` | Uses `REDIS_CABLE_URL` for Action Cable |
