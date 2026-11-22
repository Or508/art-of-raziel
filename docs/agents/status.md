# Status log (newest first)

## 2026-11-23 — Claude (review of brief 002)
- Reviewed the redesign: lint 0 errors, build passes. Desktop at 1280 matches the approved mockup (header, hero, trust strip, catalog grid with chips, about, meeting band, footer). At 375px `scrollWidth` equals the viewport: no horizontal overflow.
- Admin tables (`OrdersTable.css`, `OrderDetailsModal.css`) still use the old cyan. That was out of scope; fold it into the next client brief.

## 2026-11-23 — Cursor (brief 002)
- Storefront restyled around one symbol: `docs/agents/assets/emblem.svg` copied to `client/src/assets/emblem.svg`. Removed quill, crown, he, wings, and the unused shared amulet photo. Favicon (64×64, transparent) and `og.png` (1200×630, night blue, Cinzel wordmark) are rendered from the emblem.
- Tokens on `:root` (night blue `#0C1E37`, gold `#D9AE55`, and the rest of the brief). `--gold-primary: #D4AF37` stays so the admin CSS still resolves. Fonts: Cinzel (wordmark and eyebrows), Frank Ruhl Libre (headings), Heebo (body, nav, buttons). Cyan glows and text gradients are gone from the storefront, cart, checkout, thank-you, modals, and legal pages.
- Header has no admin button, an all-Hebrew desktop nav, and a hamburger under 768px. Home order is hero, trust strip, catalog (chips + one grid, emblem placeholder for amulets without their own photo), about (brief copy), meeting band, footer with a quiet admin link. Cart and checkout close the mobile menu. Behaviour and API calls are unchanged.
- Checked at 375px in Hebrew (RTL) and English (LTR): header, hero, catalog (two columns), checkout, and footer. `documentElement.scrollWidth` stayed 375. Desktop header shows the links, meeting pill, language, sign-in, and cart.
- `npm run lint --prefix client` passed (3 existing react-hooks warnings, 0 errors). `npm run build --prefix client` passed.
- Left: legal copy still has `[למלא]` / `[TO FILL]` in Claude's `client/src/content/legal.js`. `og:image` is the root-relative `/og.png`. Admin dashboard is not restyled and still sits under the storefront header. With the API down, the DEV catalog is the mock set (stock 0), so every add button reads unavailable.

## 2026-11-23 — Claude (redesign)
- The user approved a redesign around the wings emblem. Opened brief 002 for Cursor (tokens, fonts, header, hero, trust strip, catalog grid, about, meeting band, footer, mobile menu).
- Vector emblem for Cursor to copy: `docs/agents/assets/emblem.svg`.
- Server: `splitPhone` in `ordersController.js` now matches known country codes (+972, +1, …) instead of a greedy 1–4 digit match, so +972501234567 shows as +972 / 501234567.
- Launch commit `2299037` is on `main`. Railway is not set up yet.

## 2026-11-22 — Claude (review of brief 001)
- Reviewed Cursor's diff: no card fields, no `/api/payments`, no direct `VITE_API_URL` left. Lint 0 errors (3 old hook warnings), build passes.
- End to end on a scratch DB with the built site: catalog shows 14 products in ₪, legal pages and footer render, a tampered order (price 1, status Paid, ILS) was saved as Pending, USD, catalog price. Admin login and `/api/admin/orders` work.
- Note: a local build bakes `client/.env`'s `VITE_API_URL=http://localhost:5000` into `dist`. Railway has no `client/.env`, so it calls its own address.
- Small, not fixed: the admin order view splits phone codes greedily (+972501… shows as +9725 / 01…). The full number is still correct.
- Ready to commit and push to `main`, then deploy per `docs/DEPLOY-RAILWAY.md`.

## 2026-11-22 — Cursor (brief 001)
- Checkout no longer collects a card or calls `/api/payments/charge`. The last step is "שליחת הזמנה" / "Send order request", posts `/api/orders` without `paymentId`, and requires the terms checkbox. The thank-you page shows the server `order.totalAmount` with `formatStorePrice`. WhatsApp opens only from the button on that page.
- `client/src/utils/api.js` (`apiUrl`) replaces every `import.meta.env.VITE_API_URL` use. Mock products are a DEV-only fallback. In production a failed `/api/products` shows "לא הצלחנו לטעון את הקטלוג. נסו שוב." / "We couldn't load the catalog. Please try again." with a retry button.
- Storefront footer (not the admin dashboard) and `LegalPage` on `#privacy`, `#terms`, and `#accessibility`, rendering `client/src/content/legal.js`.
- Admin dashboard keeps orders, products, meetings, contact requests, and customers. Removed visitor traffic, customer breakdown, top products, AIInsights, LiveActivityFeed, and GlobalMapWidget, plus files nothing imports (`dashboardData.js`, `dashboardUtils.js`, `data/mockOrders.js`, `Charts.jsx` and the widget CSS). No summary counts: the dashboard does not fetch orders itself, and this brief adds no new API call.
- `client/index.html` is `lang="he" dir="rtl"`, with the description and Open Graph tags. `favicon.png` and `og.png` (1200×630) are made from `crown.png`. `vite.svg` is deleted. Switching to English sets the document to LTR.
- `npm run lint --prefix client` passed (3 existing react-hooks warnings, 0 errors). `npm run build --prefix client` passed.
- Left: legal copy still has `[למלא]` / `[TO FILL]` in Claude's `client/src/content/legal.js`. `og:image` is the root-relative `/og.png`.

## 2026-11-22 — Claude (Railway)
- Hosting is Railway. Added `railway.json` (build `npm run build`, start `npm start`, health `/health`).
- `npm start` runs `server/scripts/initDb.js` first: schema, catalog seed from `server/database/seed-products.json` (14 products from the local DB) when empty, first admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` when none. Tested twice on a scratch DB.
- `server/config/dbOptions.js` reads `DB_*` or Railway's `MYSQL*` variables.
- Step-by-step guide for the user: `docs/DEPLOY-RAILWAY.md`. Deploy waits for brief 001 + a commit pushed to `main`.

## 2026-11-22 — Claude
- Launch audit done. Opened brief 001 for Cursor (checkout without card form, footer and legal pages, real-data admin, API base URL, SEO).
- Claude is working on `server/**`: catalog prices only (the client cannot set price, total, or status), admin email on every new order, mock card charge removed, Express serves the built site in production, legal texts in `client/src/content/legal.js`.
