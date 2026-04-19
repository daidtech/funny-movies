# Funny Movies

Funny Movies is a full-stack YouTube video sharing application.

The project uses a Rails API backend and a Next.js frontend, with Redis, Sidekiq, and ActionCable for real-time notifications when a new video is shared.

## Stack

- Backend: Ruby 3.2.2, Rails 7.1, PostgreSQL, Redis, Sidekiq, Devise JWT
- Frontend: Next.js 15, React 19, TypeScript, Bootstrap
- Realtime: ActionCable + Redis
- Infra: Docker, Docker Compose, Nginx

## Features

- User registration, login, and logout
- Share YouTube videos
- Public video feed
- Real-time notification when another user shares a video
- Monorepo setup for easier review and deployment

## Repository Structure

```text
funny-movies/
├── backend/                   # Rails API
├── frontend/                  # Next.js app
├── docker-compose.yml         # Development services
├── docker-compose.prod.yml    # Production overrides
├── nginx/                     # Reverse proxy config
└── .github/workflows/         # CI workflow
```

## Services

The monorepo is designed around five services:

- `backend`: Rails API on port `3000`
- `frontend`: Next.js app on port `8000` in Docker
- `sidekiq`: background worker for notification jobs
- `db`: PostgreSQL 16
- `redis`: Redis 7

## Prerequisites

For Docker-based development:

- Docker
- Docker Compose plugin

For local non-Docker development:

- Ruby 3.2.2
- Bundler
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

## Quick Start With Docker

This is the intended reviewer flow.

```bash
git clone git@github.com:daidtech/funny-movies.git
cd funny-movies
docker compose up --build
```

In another terminal, initialize the database the first time:

```bash
docker compose exec backend rails db:create db:migrate
```

Then open:

- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:3000`

## Local Development Without Docker

### 1. Start backend dependencies

Run PostgreSQL and Redis locally first.

### 2. Start the Rails backend

```bash
cd backend
bundle install
rails db:create db:migrate
rails s -p 3000
```

### 3. Start Sidekiq

```bash
cd backend
bundle exec sidekiq -C config/sidekiq.yml
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The current frontend dev script runs on port `8000` outside Docker.

## Environment Variables

Production environment variables are documented in `.env.example`.

Typical production setup:

```env
DB_PASSWORD=change_me
SECRET_KEY_BASE=generate_with_rails_secret
RAILS_ENV=production
CORS_ORIGINS=https://yourdomain.com
API_URL=https://api.yourdomain.com
CABLE_HOST=api.yourdomain.com
```

## Testing

Backend test suite:

```bash
cd backend
bundle exec rspec
```

Frontend test suite:

```bash
cd frontend
npm test
```

Coverage report:

```bash
cd frontend
npm run test:coverage
```

## Deployment

Production deployment is designed around Docker Compose with the production override:

```bash
cp .env.example .env
# edit .env

docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
docker compose exec backend rails db:create db:migrate
```

Recommended hosting options:

- VPS with Docker and Nginx
- Render
- Railway

The `nginx/` directory contains a reverse proxy example for serving the frontend, API, and ActionCable traffic.
