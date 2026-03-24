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
    frontend.env
    mysql.env
  nginx/
    default.conf
```

## Files

- `.env.example`: compose-level image names, tag, and active profiles
- `compose.yml`: nginx + frontend + backend + optional mysql services
- `env/*.env.example`: runtime env examples for each service
- `nginx/default.conf`: reverse-proxy config for frontend traffic and `/api/v1/*`

## Deployment Notes

- Keep runtime env files on the server only. Do not commit production secrets.
- Default mode uses the local MySQL container through `COMPOSE_PROFILES=mysql`.
- To switch to an external database, omit the `mysql` profile and set `DB_HOST` and `DB_PORT` in `env/backend.env`.
- The GitHub Actions workflow expects these assets to live at `/opt/reserva` on the EC2 host.
