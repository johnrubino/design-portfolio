# Board (private ops desk)

Dense hiring status ledger on the portfolio design system (`design-system.css` — Optima / Geist). Not Soft Orbit.

## View locally

```bash
npx serve . -p 3000
# or: python3 -m http.server 3000
```

- List: http://localhost:3000/board  
- Detail: http://localhost:3000/board/amazon-10506011  

On localhost the gate allows preview when `/api/board-auth` is unavailable. In production, open with `?key=YOUR_ADMIN_KEY` (same `ADMIN_KEY` as hiring generate / views).

## API

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/board-auth` | GET | `?key=` / `x-admin-key` | Private gate |
| `/api/board-action` | POST | same | Stub → Jobi webhook later |

Action body: `{ "jobId", "action", "source": "board" }`. Sender / webhook secrets stay server-side (`JOBI_WEBHOOK_URL` optional).

## Seed

`board/jobs.json` — Amazon sample card for first paint.
