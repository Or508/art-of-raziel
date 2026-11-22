# Status log (newest first)

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
