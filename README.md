# Funny Movies

Funny Movies is a full-stack YouTube video sharing application.

The project uses a Rails API backend and a Next.js frontend, with Redis, Sidekiq, and ActionCable for real-time notifications when a new video is shared.

Live Demo: https://sharevideo.daidtech.com/

What makes the app work is simple: one user drops a YouTube link into the system, the feed updates, and everyone else sees it move in real time.

## What You Can Do

- User registration, login, and logout
- Share YouTube videos
- Public video feed
- Real-time notification when another user shares a video

## Start Here

### Prerequisites

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

## Environment Variables

The backend Rails API uses a YAML file for secrets and environment variables. Copy the example file and fill in your own values:

```bash
cp backend/config/application.example.yml backend/config/application.yml
```

Edit `backend/config/application.yml` and set your secrets:

```yaml
DEVISE_SECRET_KEY: your_devise_secret_key_here
DEVISE_JWT_SECRET_KEY: your_devise_jwt_secret_key_here
CORS_ORIGINS: http://localhost:8000 http://localhost:3000
```

- `DEVISE_SECRET_KEY` and `DEVISE_JWT_SECRET_KEY` are required for authentication.
- `CORS_ORIGINS` should include all allowed frontend origins (space or comma separated).

> **Do not commit your real `application.yml` with secrets to version control. Only commit `application.example.yml` as a template.

> **Note:** The `application.yml` environment variables are required for both Docker and local (non-Docker) development. Always ensure this file is present and correctly configured before starting the backend, regardless of how you run the app.

### Quick Start With Docker

This is the fastest way to review the app.

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

### Local Development Without Docker

1. Start PostgreSQL and Redis locally.
2. Start the Rails backend:

```bash
cd backend
bundle install
rails db:create db:migrate
rails s -p 3000
```

3. Start Sidekiq:

```bash
cd backend
bundle exec sidekiq -C config/sidekiq.yml
```

4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The current frontend dev script runs on port `8000` outside Docker.

## Use The App

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


## Inside The Repo

```text
funny-movies/
├── backend/                   # Rails API
├── frontend/                  # Next.js app
├── docker-compose.yml         # Development services
├── docs/                      # Deployment guides
├── nginx/                     # Reverse proxy config
└── .github/workflows/         # CI workflow
```

The monorepo is designed around five services:

- `backend`: Rails API on port `3000`
- `frontend`: Next.js app on port `8000` in Docker
- `sidekiq`: background worker for notification jobs
- `db`: PostgreSQL 16+
- `redis`: Redis 7+

## Guides

- [Railway Production Deployment](docs/railway-production-deployment.md)

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
docker compose exec backend bundle exec rails db:create db:migrate
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

---

## What to do next:

### 1. No password confirmation on registration
- The registration form does not require users to confirm their password. Adding a password confirmation field and backend validation will help prevent user typos and improve security.

### 2. No pagination on videos endpoint
- The videos API endpoint currently returns all videos without pagination. Implementing pagination will improve performance and scalability for large datasets.

### 3. Replace Email With Username (Profile Handle)
- The application currently displays user email addresses publicly (e.g., in notifications or video feeds). For privacy and security, update the frontend and backend to avoid exposing user emails. Instead, add a profile handle (username) to each user and display this handle in place of the email wherever user identity is shown.
- Update registration to require a unique username (profile handle).
- Update all API responses, notifications, and UI components to use the username instead of the email for user display.

### 4. Edit/Delete Shared Videos (Owner Only)
- Users can now edit or delete videos they have shared. Only the owner of a video will see edit and delete options for their own videos in the UI.
- The backend provides endpoints to update or remove a video, with authorization to ensure only the owner can perform these actions.
- The frontend displays edit/delete buttons for owned videos and updates the feed in real time after changes.

### 5. UI Framework Migration: Bootstrap → Tailwind CSS
- The frontend UI has been migrated from Bootstrap to Tailwind CSS for more flexible, utility-first styling and easier customization.
- All components and layouts now use Tailwind classes instead of Bootstrap classes.
- The Bootstrap dependency has been removed from the project.

### 6. Upgrade Rails and Next.js Versions
- Upgrade the backend to the latest stable version of Rails for improved security, performance, and new features.
- Upgrade the frontend to the latest stable version of Next.js for better performance, new features, and long-term support.
- Update all related dependencies and test the application thoroughly after upgrades.