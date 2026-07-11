# Backend Testing

## Unit and HTTP Integration

Run from `backend/`:

```bash
GOCACHE=/tmp/go-build-cache go test ./...
```

This covers usecase validation, middleware behavior, and router/handler integration with `httptest`.

## Database Integration

Requires a real PostgreSQL database. The test runs embedded migrations and cleans up the inserted project row.

```bash
TEST_DATABASE_URL=postgres://user:password@localhost:5432/web_porto?sslmode=disable \
GOCACHE=/tmp/go-build-cache \
go test -tags=integration ./internal/repository
```

## Performance Smoke With K6

Start the backend first, then run from the repository root:

```bash
k6 run backend/tests/performance/k6_smoke.js
```

Against production after deployment:

```bash
BASE_URL=https://aruu.app k6 run backend/tests/performance/k6_smoke.js
```

For higher load, raise `RATE_LIMIT_RPS` and `RATE_LIMIT_BURST` on the backend environment first, then set:

```bash
BASE_URL=http://localhost:8080 VUS=20 DURATION=1m k6 run backend/tests/performance/k6_smoke.js
```
