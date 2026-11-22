Status: done
For: cursor

# 002: Redesign the storefront around the wings emblem

The user approved a new look (mockup reviewed on 2026-11-23). The site gets **one symbol**, the wings with the Star of David, and a calm night-blue and gold look instead of black with cyan neon. This brief is the full spec. You cannot open the mockup, so everything you need is written here.

Ownership is in `docs/agents/README.md`. You own `client/**` except `client/src/content/**`. Do not edit `server/**`. Behaviour does not change: same data, same API calls, same checkout flow from brief 001. This brief is look, layout, and copy only.

## 1. The emblem

- The vector emblem is `docs/agents/assets/emblem.svg` (viewBox 400×240, transparent background, no text). Copy it to `client/src/assets/emblem.svg` and use it everywhere a logo appears.
- Remove the other marks from the storefront: the quill (`quill.png`) in the nav, the floating `he.png` and `crown.png` (`floating-asset` in `App.jsx`), and the floating logo cards in `HeroSection`. Delete those image files and `wings.png` once nothing imports them.
- Regenerate `client/public/favicon.png` (64×64; crop to the medallion and wings, transparent) and `client/public/og.png` (1200×630: emblem centred on `#0C1E37`, "ART OF RAZIEL" in Cinzel gold under it) from the new emblem.

## 2. Design tokens

Define these once as CSS custom properties on `:root` in `App.css` and use them instead of hard-coded colours. Remove the cyan/neon colours, glows, `box-shadow` glows, and text gradients from the storefront.

| Token | Value | Use |
| --- | --- | --- |
| `--ground` | `#0C1E37` | page background |
| `--ground-deep` | `#0A1A30` | alternating sections (trust strip, about) |
| `--ground-footer` | `#081528` | footer |
| `--surface` | `#10264A` | cards |
| `--gold` | `#D9AE55` | wordmark, primary buttons, outlines, small labels |
| `--gold-hover` | `#F3D894` | link and outline hover |
| `--ink` | `#F4EEDF` | headings |
| `--text` | `#EDE6D6` | body text and nav links |
| `--muted` | `#A9B4C6` | secondary text, captions |
| `--soft` | `#B9C3D3` | hero and section sub-lines |
| `--line` | `rgba(217,174,85,0.22)` | hairlines and card borders |
| `--line-neutral` | `rgba(237,230,214,0.3)` | neutral button borders |
| `--in-stock` | `#8FD3A8` | "במלאי" |

The wing blue lives only inside the emblem. Do not use it for UI.

Fonts (one Google Fonts link in `client/index.html`, replacing the current one): `Cinzel` 500/600 for the Latin wordmark and small Latin eyebrow labels only; `Frank Ruhl Libre` 500/700 for every heading (Hebrew and English); `Heebo` 400/500 for body, nav, and buttons. Remove the wide letter-spacing on Hebrew text. Letter-spacing is only for Cinzel.

Shape: buttons and chips are pills (`border-radius: 999px`), at least 44px tall. Cards have `border-radius: 14px` and a 1px `--line` border. Hairlines between sections are 1px `--line`.

## 3. Header (`App.jsx` nav)

- Content width `max-width: 1240px`, centred, `padding: 14px 24px`, bottom hairline.
- Start side (right in Hebrew): emblem 76×46 + "ART OF RAZIEL" in Cinzel 20px gold, `letter-spacing: 0.08em`. It links to the top.
- Nav links in `--text`, 16px, all in the current language (today Hebrew mode shows "Products" and "Home" in English, so fix that): he `הקטלוג`, `מזוזות`, `קמיעות וחותמות`, `על רזיאל`; en `Catalog`, `Mezuzahs`, `Amulets & Seals`, `About Raziel`. The category links scroll to the catalog with that category selected.
- End side: an outlined gold pill `קביעת פגישה` / `Book a meeting` that opens the existing contact modal, the language toggle (round 44px, Cinzel 13px, `--line-neutral` border), and the cart as a round 44px icon button with `aria-label` and the item count as a small gold badge.
- **Remove the admin login button from the header.** Admin login moves to the footer (section 8). When an admin is signed in, the Dashboard and sign-out controls can stay in the header.
- Customer sign-in/registration (`AuthModal`): keep it reachable, as a small text link next to the cart, not a big button.
- Under 768px: emblem 58×36 + wordmark 15px on one side, cart + a menu button (hamburger, `aria-label="תפריט"` / "Menu", `aria-expanded`) on the other. The menu opens a full-width panel under the header with the nav links, the meeting button, the language toggle, and the sign-in link stacked. Nothing in the header may overflow at 375px wide.

## 4. Hero (`HeroSection.jsx`)

Centred, `padding: 72px 24px 88px`, column with `gap: 22px`, `max-width: 880px`:
1. The emblem, `width: min(440px, 90%)`, alt he "הסמל של Art of Raziel: מגן דוד בתוך מדליון זהב עם כנפיים", en "Art of Raziel emblem: a Star of David in a gold medallion with wings".
2. "ART OF RAZIEL": Cinzel 22px, gold, `letter-spacing: 0.32em`.
3. `<h1>` in Frank Ruhl Libre 700, 60px (38px on phones), `--ink`: he "אמנות קודש בעבודת יד", en "Sacred art, made by hand".
4. Sub-line 20px (17px on phones), `--soft`, `max-width: 560px`: he "מזוזות, קמעות וחותמות שנכתבים בטהרה, ומגיעים אליכם ישירות מהאמן רזיאל." en "Mezuzahs, amulets, and seals written in purity, sent to you directly from the artist Raziel."
5. Two pills: filled gold (text `#0C1E37`) he "לצפייה בקטלוג" / en "View the catalog", which scrolls to the catalog; outlined gold he "קביעת פגישה עם רזיאל" / en "Book a meeting with Raziel", which opens the contact modal. 48px tall. On phones they stack full width.

No background images, glows, or floating elements.

## 5. Trust strip (new, under the hero)

A full-width band on `--ground-deep` with hairlines above and below. Inside `max-width: 1240px`, a grid of three items (`repeat(auto-fit, minmax(240px, 1fr))`, stacked on phones). Each item is a 28px gold stroke icon (inline SVG, `aria-hidden`) plus 17px text:
- he "נכתב בטהרה בידי סופר סת״ם" / en "Written in purity by a certified scribe" (quill icon)
- he "כל יצירה נעשית בעבודת יד" / en "Every piece is handmade" (star icon)
- he "הזמנה ישירה מהאמן" / en "Order directly from the artist" (arrow icon)

## 6. Catalog (`ProductCatalog.jsx` and the catalog section in `App.jsx`)

- Section `padding: 88px 24px`. Heading row: a small Cinzel eyebrow "THE COLLECTION" (13px gold, `letter-spacing: 0.24em`), then `<h2>` he "הקטלוג" / en "The Collection" in Frank Ruhl Libre 700, 44px. On the other side of the row, category chips as pill buttons with `aria-pressed`: הכל / All, מזוזות / Mezuzahs, קמיעות / Amulets, חותמות / Seals. The selected chip is filled gold, the others are outlined with `--line-neutral`. On phones the chips scroll sideways in one row.
- One grid for the shown products: `repeat(auto-fill, minmax(260px, 1fr))`, `gap: 24px`; on phones two columns with `gap: 12px`. Replace the current per-category sections with this grid plus the chips.
- Card (`--surface`, 14px radius, `--line` border, no glow):
  - Image area with `aspect-ratio: 4 / 5` and `object-fit: cover`.
  - Body padding 18px: category label (13px gold: מזוזה / קמיע / חותם), title (Frank Ruhl Libre 500, 22px, `--ink`; 17px on phones), short description (14px `--muted`, hidden on phones), then a row with the price (20px, 500 weight) and the stock state. Keep the existing stock logic and messages from `utils/stock.js`. "Available" uses `--in-stock`. Then an outlined gold pill "הוספה לסל" / "Add to cart", 46px tall.
- **Images:** use `image_url` when the product has one; otherwise the existing local photo for the large mezuzah, the medium mezuzah, and the seal of Solomon. **Stop giving every amulet the same `amulet-default.png`.** An amulet without its own image shows a placeholder: the image area on `--ground-deep` with the emblem centred at 50% width and `opacity: 0.35`, no caption. Real photos will replace these.

## 7. About (`AboutSection.jsx`)

Section on `--ground-deep`, `padding: 88px 24px`, top hairline. Inside `max-width: 1100px`, a wrapping row with `gap: 48px`:
- A photo frame (`aspect-ratio: 4 / 5`, max 440px wide, 14px radius, 1px gold border at 0.3 opacity, `--surface`). There is no photo of Raziel yet: show the emblem at 40% width and `opacity: 0.35` in it. Add a `// TODO: Raziel photo` comment.
- Text column: Cinzel eyebrow "THE ARTIST", `<h2>` he "על רזיאל" / en "About Raziel" (44px), then two 18px paragraphs, `line-height: 1.8`, colour `#D3D9E3`. Replace the current text with this:
  - he 1: "שמי רזיאל יוסף. אני מדריך רוחני, ורואה בגורל דרך פתיחת ספרי קבלה וזוהר."
  - he 2: "המזוזות, הקמעות והחותמות נכתבים בידי סופר סת״ם מקובל, שעוסק אך ורק בטהרה. אפשר להזמין דרכי מזוזות, קמעות ועוד, בשירות מהיר ומקצועי ועם משלוח."
  - en 1: "My name is Raziel Yosef. I am a spiritual guide, and I read destiny by opening books of Kabbalah and the Zohar."
  - en 2: "The mezuzahs, amulets, and seals are written by a Kabbalist scribe who works only in purity. You can order mezuzahs, amulets, and more through me, with fast, professional service and shipping."

## 8. Meeting band and footer

- New section before the footer, `padding: 88px 24px`: a box (`max-width: 900px`, 1px gold border at 0.35 opacity, 20px radius, `padding: 56px 28px`, centred). `<h2>` he "רוצים יצירה אישית?" / en "Want a personal piece?" (40px). Line (18px `--soft`): he "קבעו פגישה בזום או פנים אל פנים, או כתבו לרזיאל ישירות בוואטסאפ." en "Book a Zoom or in-person meeting, or write to Raziel directly on WhatsApp." Two pills: filled gold "קביעת פגישה" / "Book a meeting" with a calendar icon (opens the contact modal), and outlined gold "וואטסאפ לרזיאל" / "WhatsApp Raziel" with a chat icon (links to `wa.me` with `getWhatsAppNumber()`).
- `SiteFooter`: `--ground-footer`, top hairline, `max-width: 1240px`, padding 36px 24px. On one side the emblem 62×38 and "© {year} Art of Raziel" in `--muted`. On the other side the existing legal links in gold, plus a quiet "כניסת מנהל" / "Admin" link in `--muted` that opens `AdminLoginModal`. On phones everything stacks.
- The floating WhatsApp button stays. Restyle it as a 56px circle with a gold 1px border on `--surface` and a gold icon. No green, no glow.

## 9. The rest of the storefront

Apply the tokens to the cart drawer, `CheckoutPage`, `ThankYouPage`, `ContactModal`, `AuthModal`, `AdminLoginModal`, and `LegalPage`: `--surface` panels, `--line` borders, gold primary buttons (pills), Frank Ruhl Libre headings, and Heebo text. Do not restyle the admin dashboard and its tables in this brief, except to swap their logo for the emblem if they show one.

## Requirements

- RTL in Hebrew and LTR in English must both look right. Use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`) instead of left/right.
- No horizontal scroll at 375px wide on any storefront screen. Check the header, hero, catalog, checkout, and footer with the browser at 375px.
- Text contrast at least 4.5:1. The tokens above pass on `--ground` and `--surface`. Do not put `--muted` text on `--gold`.
- Keep the WhatsApp, cart, checkout, stock, and legal page behaviour exactly as it is.

## Do not

- Do not edit `server/**`, `client/src/content/**`, or root files.
- Do not change API calls or the order payload.
- Do not commit unless the user asks.

## Checks (run once, at the end)

```
npm run lint --prefix client
npm run build --prefix client
```

No new lint errors in files you touched. Then add an entry at the top of `docs/agents/status.md` (what changed, anything you could not do) and set `Status: done` here.

## Questions

## Answers
