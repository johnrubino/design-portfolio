# Hiring Microsite — Setup Guide

A secure, trackable portfolio page you send to hiring managers. Links expire automatically and you get an email notification every time one is opened.

---

## One-time setup (15 minutes)

### 1. Vercel KV — view history storage

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Open your portfolio project → **Storage** tab → **Create Database** → **KV**
3. Name it anything (e.g. `portfolio-kv`)
4. Vercel auto-populates these env vars in your project — you don't need to copy them manually:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 2. Resend — email notifications

1. Sign up at [resend.com](https://resend.com) (free — 3,000 emails/month)
2. **API Keys** → **Create API Key** → copy it
3. Add to Vercel: **Project Settings → Environment Variables**:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxx`
4. *(Optional)* Verify your domain in Resend to send from `notifications@yoursite.com` instead of the default. Until then the from address defaults to `onboarding@resend.dev` which still delivers fine to your Gmail.

### 3. Add your own secret env vars

In **Vercel → Project Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `HIRING_SECRET` | any long random string | Signs tokens — keep private |
| `ADMIN_KEY` | your chosen password | Protects the /api/generate endpoint |
| `SITE_URL` | `https://yourdomain.com` | Used to build the hiring link URL |
| `NOTIFY_EMAIL` | `johnrubinodesign@gmail.com` | Where notifications go |

Generate a good `HIRING_SECRET`: open Terminal and run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Deploy

Push to main — Vercel picks up the new env vars and the three new API files automatically.

---

## Daily workflow — generating a link

Hit this URL in your browser (replace values):

```
https://yoursite.com/api/generate?company=Figma&days=14&key=YOUR_ADMIN_KEY
```

You'll get back JSON like:
```json
{
  "url": "https://yoursite.com/hiring.html?t=abc123...",
  "company": "Figma",
  "expires": "Monday, November 4, 2026",
  "days": 14
}
```

Copy the `url` value and paste it into your job application.

**Parameters:**
- `company` — company name shown to the hiring manager and in your notifications
- `days` — how long the link stays valid (1–90, default 14)
- `key` — your `ADMIN_KEY`

---

## What the hiring manager sees

1. They open your link
2. A brief "Verifying access…" spinner (< 1 second)
3. The dashboard appears — personalized: *"Prepared for Figma · Expires Nov 4, 2026"*
4. Three views: Portfolio (case studies), Writing (Substack), About
5. Clicking a case study opens a full-screen bottom sheet with the complete write-up

---

## What you see

Within seconds of them opening the link, you'll get an email:

> **👀 Figma just opened your portfolio**
> 
> Time: Oct 19, 2026 at 2:34 PM EST  
> Location: New York, NY  
> Device: Desktop · Chrome  
> Expires: November 2, 2026

If they open it again later:

> **🔄 Figma viewed your portfolio again (3 total views)**

### List recent opens (Jobi / admin)

```
https://yoursite.com/api/hiring-views?key=YOUR_ADMIN_KEY
```

Returns newest-first JSON opens recorded only for **valid, unexpired** tokens (deduped per token id + UTC hour + user-agent). Payload fields: `company`, `tokenId`, `ts`, `country`, `city`, `ua`, `path`. Reuses `ADMIN_KEY` — same secret as `/api/generate`. Storage is the existing Vercel KV / Upstash Redis store.

---

## Testing locally

Without Vercel running, the token gate detects `localhost` and shows the dashboard with a "Preview (local dev)" label — so you can develop and style freely without needing a real token.

For full end-to-end testing, use `vercel dev` in the project root (requires Vercel CLI).
