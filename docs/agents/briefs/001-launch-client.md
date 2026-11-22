Status: done
For: cursor

# 001: Get the storefront ready to go live

The site goes live with prices shown. **No payment is taken on the site.** A customer sends an order request, the order is saved, and Raziel arranges payment and shipping with the customer over WhatsApp. Card payment may come later through a real gateway. It is not part of this brief.

Ownership is in `docs/agents/README.md`. You own `client/**` except `client/src/content/**`. Do not edit `server/**`.

## 1. Checkout without a card form (`client/src/components/CheckoutPage.jsx`)

Today the checkout asks for a card number, expiry, and CVV, and then calls a mock charge that approves everything. That cannot go live: it collects card data and charges nothing.

- Remove the payment step entirely: the card fields, the yup rules for them, `formatCardNumber`, the "Enhanced Card Protection" box, and the call to `/api/payments/charge`. Claude is removing that endpoint.
- The flow becomes: customer details + shipping → review → a button **"שליחת הזמנה"** / **"Send order request"** → `POST /api/orders` (the payload it sends today, without `paymentId`).
- Show this note above the button: he: "לא מתבצע תשלום באתר. אחרי שליחת ההזמנה רזיאל ייצור איתך קשר בוואטסאפ להסדרת תשלום ומשלוח." en: "No payment is taken on the site. After you send the order, Raziel will contact you on WhatsApp to arrange payment and shipping."
- Remove the `window.open(buildOrderWhatsAppUrl(...))` that runs after the order is saved (browsers block pop-ups opened after an `await`). Keep the WhatsApp button on the thank-you page, which is already in the working tree.
- API contract change: the server now ignores `price`, `totalAmount`, `status`, and `paymentId` from the client. It prices every line from the catalog in USD and always saves `currency: 'USD'` and `status: 'Pending'`. Show the returned `order.totalAmount` on the thank-you page with `formatStorePrice` (shekels in Hebrew), not a total computed on the client.
- Rename leftover "payment" wording in the checkout and thank-you pages (for example "Payment successful") to "order received" wording.

## 2. API base URL (all 15 uses of `import.meta.env.VITE_API_URL`)

In production the API and the site are served from the same address. Add `client/src/utils/api.js`:

```js
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiUrl = (path) => `${API_BASE}${path}`;
```

Replace every `` `${import.meta.env.VITE_API_URL}/api/...` `` with `apiUrl('/api/...')`. Local dev keeps working with `VITE_API_URL=http://localhost:5000` in `client/.env`.

## 3. No fake products in production (`client/src/App.jsx`)

When `/api/products` fails, App falls back to `mockProducts` with invented prices. Keep that fallback only when `import.meta.env.DEV` is true. In production show a short message with a retry button instead: he "לא הצלחנו לטעון את הקטלוג. נסו שוב." en "We couldn't load the catalog. Please try again."

## 4. Footer and legal pages

- Add a footer to the storefront (not the admin dashboard) with links: מדיניות פרטיות / Privacy, תקנון ומדיניות משלוחים והחזרות / Terms, shipping and returns, הצהרת נגישות / Accessibility, plus the WhatsApp link (`getWhatsAppNumber()` from `utils/whatsapp.js`) and © year "Art of Raziel".
- Legal pages open on hash routes `#privacy`, `#terms`, `#accessibility`, so a link can be shared. Listen to `hashchange` in App. Closing the page clears the hash.
- One component `client/src/components/LegalPage.jsx` renders the text from `client/src/content/legal.js`, which Claude writes. Its shape: `legalPages[key][language] = { title, updated, sections: [{ heading, paragraphs: string[] }] }` where `key` is `privacy | terms | accessibility`. Render it RTL for Hebrew. If the file is not there yet when you start, build the component against that shape and check again at the end.
- The checkout gets a required checkbox before "Send order request": he "קראתי ואני מסכים/ה לתקנון ולמדיניות הפרטיות" en "I have read and agree to the Terms and Privacy Policy", with both words linking to the pages.

## 5. Admin dashboard shows only real data (`client/src/components/AdminDashboard.jsx`)

The dashboard shows invented numbers: visitor traffic, customer breakdown, top products (`utils/dashboardData.js`), `AIInsights`, `LiveActivityFeed` (random events every few seconds), and `GlobalMapWidget` with no orders. Raziel would read these as real.
- Remove those widgets from the dashboard. Keep the real tables: orders, products, meetings, contact requests, customers.
- If a summary row is wanted, compute it from the orders the dashboard already fetches (number of open orders, orders this month). Do not add new API calls in this brief.
- Delete files that nothing imports afterwards (`utils/dashboardData.js`, `data/mockOrders.js`, the removed widget components and their CSS). Do not delete `utils/dashboardUtils.js` if something still uses it.

## 6. Page head (`client/index.html`, `client/public/`)

- `<html lang="he" dir="rtl">`. App already switches direction per language. Make sure English still renders LTR.
- `<meta name="description">` he: "אמנות קודש ויודאיקה בעבודת יד מאת האמן רזיאל: מזוזות, קמעות וחותמות. הזמנה ישירה מהאמן."
- Open Graph tags (`og:title`, `og:description`, `og:type=website`, `og:image` pointing to `/og.png`). Make `client/public/og.png` (1200×630) from `src/assets/crown.png` on a dark background, or leave a TODO in the brief's Questions if you cannot make the image.
- Replace the Vite favicon (`vite.svg`) with an icon from `crown.png`. Delete `vite.svg`.

## Do not

- Do not edit `server/**`, `client/src/content/**`, root files, or `docs/agents/README.md`.
- Do not add a payment provider.
- Do not commit unless the user asks.

## Checks (run once, at the end)

```
npm run lint --prefix client
npm run build --prefix client
```

Fix new lint errors in files you touched. Then add an entry to `docs/agents/status.md` (what changed, anything left) and set `Status: done` here.

## Questions

## Answers
