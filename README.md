# Aruu Backend Systems

Portfolio backend engineer yang dibuat sebagai proof-of-work, bukan sekadar halaman statis. Frontend menampilkan profil, featured projects dari GitHub, live API playground, dan demo chess engine. Backend Go menyediakan REST API, auth, middleware, PostgreSQL persistence, rate limiting, dan WebSocket untuk Stockfish.

Production target:

- Domain: `https://aruu.app`
- VPS origin: `134.209.108.221`
- Reverse proxy: Caddy
- Runtime: Docker Compose
- Database: PostgreSQL 15

## Apa Yang Ditampilkan

- Profil backend-focused dengan stack Go, PostgreSQL, Linux, Docker, REST API, JWT, dan testing.
- Featured projects dari GitHub melalui server-side fetch di Next.js.
- API playground di landing page untuk mencoba endpoint publik dan protected flow.
- Response viewer yang scrollable agar payload panjang tidak merusak layout halaman.
- Chess engine route di `/chess` dengan WebSocket, Stockfish, dan telemetry panel.
- Connect section untuk GitHub, email, dan LinkedIn.

## Arsitektur Singkat

```text
Browser
  |
  | HTTPS / WSS
  v
Cloudflare
  |
  v
Caddy container
  |-- /api/v1/*  -> backend:8080
  |-- /ws/chess  -> backend:8080
  |-- /*         -> frontend:3000

Next.js frontend
  |-- landing page
  |-- /api/featured-projects
  |-- GitHub API fetch

Go backend
  |-- REST API
  |-- JWT protected routes
  |-- rate limit middleware
  |-- chess WebSocket
  |-- PostgreSQL repository
```

## Stack

Frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- React Chessboard

Backend:

- Go
- `net/http`
- PostgreSQL with `pgx`
- JWT
- Token bucket rate limiting
- Gorilla WebSocket
- Stockfish binary

Infrastructure:

- Docker Compose
- Caddy
- Cloudflare DNS and proxy
- K6 performance smoke test

## API Surface

Public endpoints:

```text
GET  /api/v1/health
GET  /api/v1/projects
GET  /api/v1/projects/{id}
POST /api/v1/auth/login
GET  /ws/chess
```

Protected endpoint:

```text
POST /api/v1/projects
```

Frontend-only helper route:

```text
GET /api/featured-projects
```

`/api/featured-projects` mengambil public repository dari GitHub secara server-side, memfilter repo yang tidak perlu ditampilkan, lalu mengembalikan data yang sama dengan featured project cards.

## Environment

Jangan commit file `.env`.

Root `.env` untuk backend dan database:

```env
DB_USER=postgres
DB_PASSWORD=change-this
DB_NAME=web_porto
DB_HOST=db
DB_PORT=5432

PORT=8080
APP_ENV=production
JWT_SECRET=change-this
ALLOWED_ORIGINS=https://aruu.app,https://www.aruu.app,http://localhost:3000
RATE_LIMIT_RPS=5
RATE_LIMIT_BURST=10
RATE_LIMIT_TTL_SECONDS=300
RATE_LIMIT_RETRY_SECONDS=10
STOCKFISH_PATH=/app/bin/stockfish
```

`frontend/.env` untuk Next.js:

```env
API_INTERNAL_URL=http://backend:8080
API_PROXY_URL=http://backend:8080
NEXT_PUBLIC_WS_URL=wss://aruu.app/ws/chess
GITHUB_USERNAME=akuaruu
GITHUB_TOKEN=
NEXT_PUBLIC_LINKEDIN_URL=
```

Catatan keamanan:

- `GITHUB_TOKEN` optional dan hanya dipakai server-side oleh Next.js.
- Jangan memakai prefix `NEXT_PUBLIC_` untuk token atau credential.
- `NEXT_PUBLIC_WS_URL` dan `NEXT_PUBLIC_LINKEDIN_URL` memang public karena dibaca browser.

## Local Development

Frontend ke backend lokal:

```bash
cd backend
GOCACHE=/tmp/go-build-cache go test ./...
go run ./cmd/main.go
```

```bash
cd frontend
npm install
npm run dev
```

Frontend lokal menembak API production VPS:

```env
API_INTERNAL_URL=https://aruu.app
API_PROXY_URL=https://aruu.app
NEXT_PUBLIC_WS_URL=wss://aruu.app/ws/chess
```

Lalu jalankan:

```bash
cd frontend
npm run dev
```

## Docker Production

Build dan jalankan seluruh service:

```bash
docker compose up -d --build
```

Cek container:

```bash
docker compose ps
docker logs --tail 100 porto_backend
docker logs --tail 100 porto_frontend
docker logs --tail 100 porto_caddy
```

Rebuild hanya frontend setelah perubahan tampilan:

```bash
docker compose up -d --build frontend caddy
```

Rebuild backend setelah perubahan Go:

```bash
docker compose up -d --build backend caddy
```

## Deploy Ke VPS

Di lokal:

```bash
git push
```

Di VPS:

```bash
cd /root/web-porto
git pull
docker compose up -d --build
```

Cek production:

```bash
curl -I https://aruu.app
curl https://aruu.app/api/v1/health
```

Jika chess WebSocket tidak tersambung, cek:

- `NEXT_PUBLIC_WS_URL=wss://aruu.app/ws/chess`
- Caddy route `/ws/chess`
- backend log `porto_backend`
- `ALLOWED_ORIGINS` berisi `https://aruu.app`

## Testing

Backend unit and HTTP integration:

```bash
cd backend
GOCACHE=/tmp/go-build-cache go test ./...
```

Database integration test:

```bash
cd backend
TEST_DATABASE_URL=postgres://user:password@localhost:5432/web_porto?sslmode=disable \
GOCACHE=/tmp/go-build-cache \
go test -tags=integration ./internal/repository
```

Frontend build:

```bash
cd frontend
npm run build
```

K6 performance smoke:

```bash
k6 run backend/tests/performance/k6_smoke.js
```

K6 against production:

```bash
BASE_URL=https://aruu.app k6 run backend/tests/performance/k6_smoke.js
```

Higher load smoke:

```bash
BASE_URL=http://localhost:8080 VUS=20 DURATION=1m k6 run backend/tests/performance/k6_smoke.js
```

## Struktur Project

```text
.
├── backend/
│   ├── cmd/
│   ├── internal/
│   │   ├── config/
│   │   ├── handler/
│   │   ├── middleware/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── server/
│   │   └── usecase/
│   ├── pkg/
│   │   ├── database/
│   │   └── response/
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── Dockerfile
├── Caddyfile
├── docker-compose.yml
└── README.md
```

## Notes

- Featured projects tetap fetch dari GitHub. Data fallback hanya dipakai kalau GitHub dan backend API gagal.
- Apomacy diberi metadata tambahan agar Go ikut tampil bersama TypeScript.
- API playground boleh public selama tidak mengirim credential. Endpoint write tetap protected dengan JWT dan rate limit.
- Chess engine dibuat route terpisah karena membutuhkan WebSocket, board interaktif, dan telemetry yang lebih berat daripada section biasa.
