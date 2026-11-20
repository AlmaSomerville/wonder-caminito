# Wonder — Caminito del Rey

Booking site + admin panel + partner (affiliate) program for Nati's official guided tours.
Built with Next.js 14, Prisma and Postgres. One repo, deploys to Vercel in minutes.

## What's inside

| URL | Who | What |
|---|---|---|
| `/` | Guests | Landing page in 10 languages (auto-detects device language, defaults to English, remembered), offer pop-up, SEO everything |
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

## Languages

The landing and booking pages are translated into the top 10 visitor languages for the Costa del Sol:
**English, Spanish, German, French, Dutch, Polish, Italian, Portuguese, Swedish, Danish**
(Norwegian devices get Danish, everything else falls back to English).

- Device language is detected on first load; any manual pick in the flag switcher is remembered forever (localStorage).
- The first-paint HTML is always English — that's what Google indexes, keeping SEO focused.
- All strings live in one file: `src/lib/i18n.js`. To tweak a translation, edit it there; to add language #11, copy a block and add one line to `LANGS`.
- Translations are machine-drafted: worth a quick read-through by a native speaker before launch, especially Polish and the Scandinavian ones.
- Offers are written by Nati in EN + ES; the other 8 languages see the English version of the offer text.
- The tour itself runs in EN/ES (that's Nati), so the "tour language" selector stays EN/ES by design.

## Photos

- Hero: `public/hero.jpg` (Nati's own gorge photo). Share preview image: `public/og.jpg`.
- Gallery: drop photos into `public/gallery/` with the names listed in `public/gallery/README.txt` — each one replaces its coloured tile automatically.
- Nati's portrait: `public/nati.jpg` replaces the "N" circle.

## Fonts

Her two brand fonts are self-hosted in `src/app/fonts/` (no Google request: faster, GDPR-friendly), subset to cover all 10 languages
including Polish and Nordic characters. Bodoni Moda is used only for big headlines, at a sturdier optical size for legibility;
everything you read is Plus Jakarta Sans.

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

## How the database works (for her peace of mind)

She never touches the database. Prices, dates, rules, offers, bookings, partner approvals — all of it is edited
through the `/admin` forms, which read and write the database for her. The database itself (Neon Postgres inside
Vercel) persists across every deploy and has point-in-time restore on the free tier. The only database commands
that ever get run are yours, at setup (`db:push` + `db:seed`) or when the data model changes.

## Notes & honest limitations

- Booking rules enforced server-side: cutoff hours, min/max group, capacity, optional same-day block, duplicate-email-per-day block. Edit them in `/admin/pricing`.
- Admin is single-password; fine for one person, revisit if a team grows.
- Capacity check is best-effort (not a DB transaction); at 10 seats/day with manual confirmation this is a non-issue — Nati is the final gate.
- Minimum age 8 and Monday closures reflect the official Caminito rules — worth re-verifying each season.
