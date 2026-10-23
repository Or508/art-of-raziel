# Art of Raziel

Bilingual storefront for sacred art and handcrafted Judaica by master artist Raziel. Customers browse the catalog in Hebrew or English, book a meeting, and check out. Staff manage stock, orders, and meeting requests from the same site.

## Features

- **Bilingual storefront.** Hebrew and English share one catalog. Prices are stored in USD and shown in shekels at a single rate when the language is Hebrew.
- **Sacred Judaica catalog.** Mezuzahs, amulets, and seals, with images, descriptions, and live stock.
- **Stock alerts.** Cards show Available, a low-stock warning at 5 units or fewer, a pre-order state, or a clear out-of-stock message. The cart and checkout refuse a quantity above the stock on hand.
- **Contact and booking.** Visitors pick a date and time. Booked slots are blocked, and a duplicate booking is rejected.
- **Checkout and orders.** Customer details, shipping, and cart lines are saved in MySQL. Stock is reduced in the same transaction. Card charging is still a mock approval, ready to be replaced with a real gateway.
- **Admin panel.** Sign in from **ADMIN LOGIN** on the storefront, then open the dashboard to review orders, update status, adjust stock, and manage meetings and contact requests.
- **WhatsApp.** A floating button appears when `VITE_WHATSAPP_NUMBER` is set.

## Tech stack

| Layer | Tools |
| --- | --- |
| Storefront | React 19, Vite 7, Framer Motion |
| API | Express 4, JWT, bcrypt |
| Data | MySQL 8, mysql2 |
| Forms | React Hook Form, Yup |

## Project structure

```
ArtOfRazielPj/
├── client/          React storefront and admin UI (Vite)
├── server/          Express API, MySQL access, auth, and scripts
│   ├── controllers/
│   ├── routes/
│   ├── database/schema.sql
│   └── scripts/runMigration.js
├── public/          Earlier static prototype (not served by Vite)
├── .env.example     Server environment template
└── package.json     Runs the API and Vite together
```

`client/` talks to the API with `VITE_API_URL`. `server/` reads the root `.env` for the database, JWT, CORS, email, and Google Sheets.

## Local setup

### Prerequisites

- Node.js 20 or newer, with npm
- MySQL 8 listening on port 3306

On Windows, the service name is often `MySQL80`:

```powershell
Get-Service MySQL80
Start-Service MySQL80
```

### Install dependencies

From the project root, install the root runner, the API, and the storefront:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### Environment variables

Create the root env file from the template, then replace every placeholder. Do not commit this file.

```bash
cp .env.example .env
```

The API reads these names. The password key is `DB_PASS`. The server does not read `DB_PORT`; it connects to MySQL on 3306.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DB_HOST` | Yes | Database host, usually `localhost` |
| `DB_USER` | Yes | MySQL user |
| `DB_PASS` | Yes | MySQL password |
| `DB_NAME` | Yes | Database name. The template uses `art_of_raziel` |
| `PORT` | No | API port. Defaults to `5000` |
| `JWT_SECRET` | Yes | Signing key. The API refuses to start if this is empty |
| `CLIENT_URL` | No | Allowed browser origin. Defaults to `http://localhost:5173`. Separate extra origins with commas |
| `ADMIN_EMAIL` | For admin setup | Email for `npm run create-admin` and notification mail |
| `ADMIN_PASSWORD` | For admin setup | Password for the first admin. It is hashed before it is stored |
| `ADMIN_NAME` | No | Display name. Defaults to Super Admin |
| `EMAIL_USER` | No | Gmail address used to send mail |
| `EMAIL_PASS` | No | Gmail app password. Mail is skipped when this is unset |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Sheets service account |
| `GOOGLE_PRIVATE_KEY` | No | Sheets private key |
| `GOOGLE_SHEET_ID` | No | Sheet that receives contact rows |

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000
VITE_WHATSAPP_NUMBER=972500000000
```

`VITE_WHATSAPP_NUMBER` is optional. Use digits only, with the country code and no plus sign. Leave it unset to hide the WhatsApp button. Restart Vite after changing `client/.env`.

### Database

Create the database named in `DB_NAME`, then apply the schema.

**New database.** `server/database/schema.sql` creates users, admins, products, contact requests, orders, and order items. It does not insert an admin.

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS art_of_raziel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p art_of_raziel < server/database/schema.sql
```

`CREATE TABLE IF NOT EXISTS` will not change tables that already exist.

**Existing database.** If `products` is already populated and is missing stock, price, English titles, or the order tables, run the migration from `server/`:

```bash
cd server
node scripts/runMigration.js
```

The script uses the pool in `server/config/db.js`. It adds `stock`, `price`, `title_en`, and `image_url` when they are missing, copies `price_usd` into `price` where price is empty, sets `stock` to 10 where stock is empty, and creates `orders` and `order_items`.

Create the first admin from `server/` after `ADMIN_EMAIL` and `ADMIN_PASSWORD` are in the root `.env`:

```bash
npm run create-admin
```

The script does not print the password.

### Start the app

From the project root:

```bash
npm run dev
```

That starts the API with nodemon and the Vite dev server together.

- Storefront: http://localhost:5173
- API: http://localhost:5000

Admin tools are on the storefront. Use **ADMIN LOGIN**, then **Dashboard**. There is no separate admin URL.

To run them separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Production build of the storefront:

```bash
npm run build --prefix client
```

## Production readiness and security

- **Secrets stay local.** `.gitignore` excludes `.env`, `client/.env`, `node_modules/`, and `client/dist/`. Only `.env.example` is committed, and it contains placeholders.
- **JWT.** `JWT_SECRET` must be set in the environment. There is no fallback secret in the source. Tokens expire after 7 days. Admin routes require an admin or super-admin role.
- **Passwords.** Customer and admin passwords are stored as bcrypt hashes.
- **CORS.** Browsers may call the API only from origins listed in `CLIENT_URL` (or `http://localhost:5173` when that variable is unset).
- **Rate limits.** Auth routes allow 10 requests per 15 minutes. Contact submissions allow 8 per 15 minutes. Other writes allow 60 per 15 minutes.
- **Errors.** A server failure returns a fixed message. SQL text is written to the server log, not to the client.
- **Orders.** Creating an order is one transaction: the product row is locked, stock is checked, and the order plus its lines are inserted together.
- **Still to replace before taking real payments.** `POST /api/payments/charge` approves a mock charge. It does not talk to a card processor. Point it at a live gateway before accepting customer payments. Email and Google Sheets are optional and are skipped when their variables are empty.
