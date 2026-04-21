# Funny Movies

Funny Movies is a full-stack YouTube video sharing application.

The project uses a Rails API backend and a Next.js frontend, with Redis, Sidekiq, and ActionCable for real-time notifications when a new video is shared.

Live Demo: https://sharevideo.daidtech.com/


## Features

- User registration, login, and logout
- Share YouTube videos
- Public video feed
- Real-time notification when another user shares a video


## Stack

- Backend:
  - Ruby: 3.2.2
  - Rails: 7.1
  - PostgreSQL: 16+
  - Redis: 5.3.0
  - Sidekiq: 7.3.8
- Frontend:
  - Next.js: 15
  - React: 19
  - Node.js: 20.18.1


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

- Git
- Ruby 3.2.2
- Bundler
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- NPM 10.8.2

## Quick Start With Docker

This is the intended reviewer flow.

```bash
git clone git@github.com:daidtech/funny-movies.git
cd funny-movies
docker compose up --build
```

In another terminal, after the first tab starts successfully, initialize the database:

```bash
docker compose exec backend bundle exec rails db:create db:migrate
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

## Usage

After the application is running, open `http://localhost:8000` in your browser.

Reviewer flow:

1. Register a new account from the header form using an email and password.
2. After registration, the app logs the user in automatically and shows a `Welcome <email>` message.
3. Click `Share a movie` in the header to open the share form.
4. Paste a YouTube URL, add a title and description, then submit the form.
5. Return to the home page to confirm the new video appears in the public feed.

Supported YouTube URL formats:

- `https://www.youtube.com/watch?v=<video_id>`
- `https://youtu.be/<video_id>`

Real-time notification flow:

1. Open the app in two browser windows.
2. Log in with two different accounts.
3. Share a video from one window.
4. The other logged-in window should receive a toast notification showing the sharer email and video title.
5. The shared video list should refresh automatically.

Notes:

- The video feed is public and can be viewed without logging in.
- Sharing a video requires authentication.
- Notifications use ActionCable over WebSocket and require the backend, Redis, and Sidekiq services to be running.

## Deployment

Production deployment is designed around Docker Compose with the production override:

### (BE/FS) Docker Deployment

This project supports Docker-based deployment for backend and full-stack workflows.
It is the fastest way to run the full system with PostgreSQL, Redis, Sidekiq, Rails, and Next.js together.

Build and run the application locally with Docker:

```bash
docker compose up --build
```

Build and run the production-like stack with the production override:

```bash
cp .env.example .env
# edit .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
docker compose exec backend rails db:create db:migrate
```

To rebuild only one service after a change:

```bash
docker compose build backend
docker compose up -d backend
```

To stop the containers:

```bash
docker compose down
```

Recommended hosting options:

- VPS with Docker and Nginx
- Render
- Railway

The `nginx/` directory contains a reverse proxy example for serving the frontend, API, and ActionCable traffic.

## Troubleshooting

### `docker compose up --build` succeeds but the app does not load

Check that these ports are available on your machine:

- `8000` for the frontend
- `3000` for the Rails API
- `5433` for PostgreSQL (Docker host port)
- `6380` for Redis (Docker host port)

Then verify containers are up:

```bash
docker compose ps
```

### Frontend loads but no videos appear

Check that the backend is running and reachable on `http://localhost:3000`.

If you are running locally without Docker, confirm the frontend can reach the backend using:

- `NEXT_PUBLIC_API_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_VERSION=/api/v1`

Also ensure the database has been created and migrated:

```bash
cd backend
rails db:create db:migrate
```

### Login or share actions fail with network or authorization errors

Common causes:

- The backend is not running.
- The browser still has an old `token` cookie from a previous session.
- The API URL or CORS origin is misconfigured.

For Docker development, the backend expects:

- `CORS_ORIGINS=http://localhost:8000`

If needed, clear browser cookies for the app and log in again.

### Real-time notifications do not appear

Check all of the following:

- Redis is running.
- Sidekiq is running.
- The backend WebSocket endpoint is reachable.
- The frontend is configured with the correct cable host.

For local Docker development, the expected frontend env values are:

- `NEXT_PUBLIC_ENVIRONMENT=development`
- `NEXT_PUBLIC_ORIGIN_CABLE=localhost:3000`

If running without Docker, start Sidekiq manually:

```bash
cd backend
bundle exec sidekiq -C config/sidekiq.yml
```

### Database connection errors on startup

If Rails cannot connect to PostgreSQL, make sure PostgreSQL is running and the configured database exists.

For Docker:

```bash
docker compose exec backend rails db:create db:migrate
```

For local development:

```bash
cd backend
rails db:create db:migrate
```

### Test suite fails immediately after cloning

Make sure dependencies are installed in both apps:

```bash
cd backend && bundle install
cd ../frontend && npm install
```

Then run tests separately:

```bash
cd backend
bundle exec rspec

cd ../frontend
npm test
```
