# Board (private ops desk)

Dense hiring status ledger on the portfolio design system (`design-system.css` — Optima / Geist). Not Soft Orbit.

## View locally

```bash
npx serve . -p 3000
# or: python3 -m http.server 3000
```

- List: http://localhost:3000/board  
- Detail (preferred): http://localhost:3000/board/job?jobId=amazon-10506011  
- Detail (pretty, via rewrite): http://localhost:3000/board/amazon-10506011  

On localhost the gate allows preview when `/api/board-auth` is unavailable. In production, open with `?key=YOUR_ADMIN_KEY` (same `ADMIN_KEY` as hiring generate / views).

## API

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/board-auth` | GET | `?key=` / `x-admin-key` | Private gate |
| `/api/board-action` | POST | same | Stub → Jobi webhook later |

Action body: `{ "jobId", "action", "source": "board" }`. Sender / webhook secrets stay server-side (`JOBI_WEBHOOK_URL` optional).

## Seed

`board/jobs.json` — Amazon sample card for first paint.

## Product lock (Prep vs Apply)

1. **`prep_resume`** — Jobi builds an ATS PDF and publishes it onto the Job Card LAND slot (`land.resumePath`). Primary delivery is the board, not chat. Does **not** submit an application.
2. **`apply_confirm`** on the board — John initiates apply. That confirm **is** his yes; Jobi runs ATS submit after. Never auto-apply from `prep_resume` alone. Prep and Apply stay distinct (`apply_confirm` already has `confirm: true`).

Status after prep → prefer `vetted`. Use `applying` / `sent` only after the apply_confirm flow.

## Jobi durable write path (v1)

No serverless write-to-git API for v1. Jobi updates the repo (commit to `main` or a short PR):

1. Add the PDF at `board/resumes/<jobId>.pdf`
2. Patch `board/jobs.json` for that card:
   - `land.resumePath`: `/board/resumes/<jobId>.pdf` (site-relative URL)
   - optionally `land.resumeFileName`: display name (e.g. `Amazon-Elevated-Shopping.pdf`)
   - `status`: after prep → `vetted` (prefer); `applying` / `sent` only after apply_confirm

Example (Amazon seed):

```json
"land": {
  "resumePath": "/board/resumes/amazon-10506011.pdf",
  "resumeFileName": "Amazon-Elevated-Shopping.pdf"
}
```

LAND UI shows the filename + an Open link (not the raw path as the only label).
