# EC2 Semideploy Assets

These files define the lightweight EC2 deployment baseline for Reserva.

## Server Layout

Recommended deployment directory:

```text
/opt/reserva/
  .env
  compose.yml
  env/
    backend.env
    mysql.env
  nginx/
    default.conf
```

## Files

- `.env.example`: compose-level image names, tag, and active profiles
- `compose.yml`: nginx + backend + optional mysql + redis services
- `env/*.env.example`: backend and mysql runtime env examples
- `nginx/default.conf`: reverse-proxy config for backend `/api/v1/*`

## Deployment Notes

- Keep runtime env files on the server only. Do not commit production secrets.
- Default mode uses the local MySQL container through `COMPOSE_PROFILES=mysql`.
- To switch to an external database, omit the `mysql` profile and set `DB_HOST` and `DB_PORT` in `env/backend.env`.
- Redis now runs alongside the backend on the internal Docker network and should stay unreachable from the public internet.
- The frontend is expected to run on Vercel instead of this EC2 host.
- Set `BACKEND_BASE_URL` in the Vercel project to the public backend origin served by this nginx host, for example `https://api.example.com`.
- Keep browser requests same-origin to the Vercel app and let the Next.js route handlers forward cookies to the backend. This avoids cross-site session-cookie issues.
- The GitHub Actions workflow expects these assets to live at `/opt/reserva` on the EC2 host.
