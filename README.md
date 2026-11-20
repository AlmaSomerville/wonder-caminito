# Wonder — Caminito del Rey

Booking site + admin panel + partner (affiliate) program for Nati's official guided tours.
Built with Next.js 14, Prisma and Postgres. One repo, deploys to Vercel in minutes.

## What's inside

| URL | Who | What |
|---|---|---|
| `/` | Guests | Landing page (EN/ES toggle), offer pop-up, SEO everything |
| `/book` | Guests | Booking in under a minute. No payment yet — "reserve, pay on confirmation" (Stripe is phase 2) |
| `/where-is-caminito-del-rey` | Google | SEO page targeting that exact search (and the whereiscaminitodelrey.com domain) |
| `/affiliates` | Hotels etc. | Partner pitch + signup with Spanish tax fields (razón social, NIF/CIF, IBAN) |
| `/partner` | Approved partners | Their tracking link, their bookings only, monthly totals |
| `/admin` | Nati | Overview, bookings (confirm/cancel + WhatsApp them), availability, prices & rules, pop-up offers, partner approvals |

How affiliate tracking works: a partner shares `https://yoursite.com/?ref=THEIRCODE` (or `/a/THEIRCODE`).
Visitors get a 30-day cookie; any booking they make is credited to that partner automatically.

## Deploy (first time, ~15 minutes)

1. **GitHub**: create a new repository and push this folder to it.
2. **Vercel**: vercel.com → *Add New → Project* → import the repo. Don't deploy yet.
3. **Database**: in the Vercel project → *Storage* → *Create Database* → **Neon (Postgres, free)**. Connect it — this adds `DATABASE_URL` automatically.
4. **Environment variables** (Project → Settings → Environment Variables), from `.env.example`:
   - `AUTH_SECRET` — any long random string
   - `ADMIN_PASSWORD` — Nati's password for `/admin`
   - `NEXT_PUBLIC_SITE_URL` — your primary domain, e.g. `https://wondercaminito.com`
   - `NEXT_PUBLIC_WHATSAPP` — her number, digits only with country code, e.g. `34612345678`
5. **Deploy.**
6. **Create the tables + starter data** (one time). On your computer:
   ```bash
   npm install
   # put the DATABASE_URL from Vercel into a local .env file, then:
   npm run db:push
   npm run db:seed
   ```
   (Seed creates the settings row, 30 days of 9:00 slots skipping Mondays, and one draft offer.)
7. **Domains**: in Vercel → Settings → Domains, add both `wondercaminito.com` (primary) and
   `whereiscaminitodelrey.com`. Set the second to **redirect (308)** to the primary — that way Google
   treats them as one site and all the SEO juice lands in one place.

Local dev: `npm install`, copy `.env.example` → `.env`, `npm run db:push && npm run db:seed`, `npm run dev`.

## Nati's daily routine (2 minutes)

1. Open `/admin` → the orange banner shows new bookings → **Confirm** → **WhatsApp them** (message is pre-written).
2. Once a week: `/admin/availability` → open the next batch of dates she has tickets for.
3. Whenever: `/admin/offers` → create an offer → **Go live** → it pops up on the homepage instantly.
4. Partner applies → she gets it in `/admin` → **Approve** → their link starts working.

Commission is deliberately *not* automated: she sees each partner's bookings and booked value,
and settles by invoice per whatever she agrees with each one (as requested).

## SEO checklist after launch

- Google Search Console: add the primary domain, submit `/sitemap.xml`.
- Google Business Profile for "Wonder Caminito del Rey" (Álora) — biggest single lever for tour guides.
- The structured data (TouristTrip + FAQ) is already in the pages; test with Google's Rich Results tool.
- Get a handful of links: Álora town site, El Chorro accommodation pages — the affiliate program is exactly this.

## Phase 2 (already designed for)

- **Stripe**: add a checkout step in `/book` after the reserve step; bookings already carry `totalEUR` and `status` (`PENDING` → paid = `CONFIRMED`).
- **Email receipts**: add Resend (free tier) in `src/app/api/bookings/route.js` after booking creation.
- **Commission automation**: per-partner % field on `Affiliate` and a monthly statement page — the data model already records everything needed.

## Notes & honest limitations

- Booking rules enforced server-side: cutoff hours, min/max group, capacity, optional same-day block, duplicate-email-per-day block. Edit them in `/admin/pricing`.
- Admin is single-password; fine for one person, revisit if a team grows.
- Capacity check is best-effort (not a DB transaction); at 10 seats/day with manual confirmation this is a non-issue — Nati is the final gate.
- Minimum age 8 and Monday closures reflect the official Caminito rules — worth re-verifying each season.
