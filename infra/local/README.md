# Local Infra

Use this compose file for local development infrastructure on Windows, macOS, or Linux.

It starts only:
- MySQL on `localhost:3308`
- Redis on `localhost:6379`

Recommended local development flow:
- run `docker compose -f infra/local/compose.yml up -d`
- run the backend locally with `backend/run-local.ps1`
- run the frontend locally with `npm run dev` inside `frontend`

Current `backend/.env` already matches this local setup:
- `DB_HOST=localhost`
- `DB_PORT=3308`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`

Stop the local infra with:

```powershell
docker compose -f infra/local/compose.yml down
```

Remove local MySQL data as well with:

```powershell
docker compose -f infra/local/compose.yml down -v
```
