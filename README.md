# DIEORUN — Move. Meet. Repeat.

A Persian / RTL, map-first sports discovery and registration website. Prepared for Dieorun Club, 21 October 2026.

**Start here:** open `docs/SETUP_FA.html` in a browser for the full illustrated-by-code Persian setup guide. A short English sequence is below.

## What works immediately

- 264 unmistakably synthetic events across 22 approximate Tehran districts, eight sports and four activity types.
- Real OpenStreetMap + locally bundled Leaflet, synchronized map/list filtering by time, exact date, fee, district and sport.
- Event details, calendar, favorites, sample coach profiles, About, partnerships, FAQ, support, privacy and cancellation pages.
- Local demo account → sample checkout → sample receipt → bookings dashboard.
- Responsive mobile map/list switch, Persian font, keyboard navigation and printable receipts.
- Exact official social links supplied by the owner.

Demo mode does NOT authenticate real people, email anyone, write a spreadsheet, collect money or reserve real places. Never enter real data into a publicly hosted demo. All sample locations are invented; do not travel to them.

## Included implementation requiring owner setup

`backend/worker.mjs` + Cloudflare D1: email OTP authentication; hashed sessions; rate limits + Turnstile; authoritative price/capacity checks; one active reservation per account/event; Zarinpal request/verification; free registrations; 20-minute reservation holds; idempotent verified payments; authenticated order history; admin event publishing; private notification outbox with scheduled retries.

`google-apps-script/Code.gs`: signed, server-only connection to private Google Sheets. Verified new accounts append to **Members**, confirmed registrations to **Registrations**, verified payments to **Payments**. Sends account/payment notifications to **r.s.vojoudi@gmail.com** by default. OTP mail goes only to the member. No password or bank-card data is stored in the spreadsheet.

Google Sheets is the continuously updated workbook. Export `.xlsx` with File → Download → Microsoft Excel. A separate Excel file is not created for every member.

## 1. Put the project on GitHub

1. Extract the ZIP. Do not upload the ZIP itself.
2. Create a new repository called `dieorun-club` in GitHub. Do not replace your personal website repository.
3. In the repository choose **Add file → Upload files**. Upload the files and folders inside this project so `index.html`, `site/`, `backend/`, `docs/` and `wrangler.jsonc` are at repository root.
4. Commit with: `Build Dieorun map-first website and registration backend`.
5. To inspect the noncommercial demo, go to **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Open the URL GitHub displays. The root page redirects to `site/`.
6. Keep `site/config.js` in demo mode on GitHub Pages. GitHub Pages does not permit sites primarily facilitating commercial transactions. Use GitHub for source control and the full Worker deployment below for real registration/payment.

For CLI instead, after creating an empty remote repository:

```bash
git init -b main
git add .
git commit -m "Build Dieorun map-first website and registration backend"
git remote add origin https://github.com/YOUR_USERNAME/dieorun-club.git
git push -u origin main
```

## 2. Run the local demo

Use any static web server (opening the HTML with `file://` will block JavaScript modules):

```bash
python -m http.server 8000 --directory site
```

Open `http://localhost:8000`. No npm installation is required for the demo.

## 3. Configure the full site

Install Node.js 24 LTS (Node 22.13+ can also run the tests) and run in the project folder:

```bash
npm install
npx wrangler login
npx wrangler d1 create dieorun
```

Paste the returned database ID into `wrangler.jsonc` → `d1_databases[0].database_id`. Then:

```bash
npm run db:init
npm run deploy
```

The first deployment stays in demo mode and real registration remains disabled. Copy the deployed origin (HTTPS, no trailing slash) into `wrangler.jsonc` → `vars.PUBLIC_ORIGIN`.

## 4. Make the private sheet and email bridge

1. In the Google account that will send the notifications, create **Dieorun Members & Payments** in Google Sheets. Keep it private.
2. Extensions → Apps Script. Replace `Code.gs` with `google-apps-script/Code.gs`.
3. Project Settings → Show appsscript.json; copy `google-apps-script/appsscript.json`.
4. Script properties: `SPREADSHEET_ID` (ID from the sheet URL), `OWNER_EMAIL=r.s.vojoudi@gmail.com`, and a long random `BRIDGE_SECRET`.
5. Run `setup()` once; review and grant the requested spreadsheet/email permissions. It creates the tabs but does not send a test email.
6. Deploy → New deployment → Web app → Execute as **Me** → Who has access **Anyone**. The endpoint is public but rejects requests without a valid HMAC; the sheet remains private. Workspace policy may restrict this deployment option.
7. Copy the `/exec` URL. After changes to Apps Script, deploy a new version.
8. Add Worker secrets interactively (the CLI prompts for each value):

```bash
npx wrangler secret put SHEETS_WEBHOOK_URL
npx wrangler secret put BRIDGE_SECRET
npx wrangler secret put OTP_SECRET
```

Use a DIFFERENT long random secret for `OTP_SECRET`. Generate secrets locally with a password manager or `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Do not paste secrets in GitHub, config.js, sheet cells or chat.

## 5. Configure authentication

Create a Cloudflare Turnstile widget for your deployed hostname. Set its public site key in `site/config.js` and its private key using:

```bash
npx wrangler secret put TURNSTILE_SECRET
```

Keep `ADMIN_EMAILS` set to `r.s.vojoudi@gmail.com` or your verified administrator email(s), comma-separated. The API verifies admin email from the session, never from a client-supplied role.

Complete the real organizer/contact/retention/cancellation/age/insurance policies in `site/assets/app.js` before enabling signup. Then set `LEGAL_APPROVED` to `"true"` and `mode: 'live'` in `site/config.js`. Keep `apiBase: ''` so everything runs on the same Worker origin. Deploy again. Sign up with the administrator email, verify the emailed code and open `/#/admin`.

## 6. Add real events

Use `docs/event-template.json` in the admin panel. Replace every placeholder, verify the coordinates, set a future date with `+03:30`, and set `published: true`, `sample: false`.

- `fee` is an integer in **toman**; server sends ×10 **rials** to the gateway.
- `capacity` is total places. Remaining places are computed on the server.
- `sport`: run, functional, crossfit, volleyball, basketball, football, yoga, cycling.
- `type`: class, event, competition, challenge.
- Every new date/session gets its own unique ID. This version sells one place per account/event, not bundles or subscriptions.
- Reusing an ID updates an event. Set `published: false` to stop new registrations. Existing orders remain.
- Edit trainer profiles in `coaches()` in `site/assets/app.js`; replace placeholders with approved real names, qualifications and photographs.

## 7. Configure and test payments

Obtain your own approved Zarinpal merchant configuration. Register the exact callback URL:
`https://YOUR_DOMAIN/api/payment/callback`.

```bash
npx wrangler secret put ZARINPAL_MERCHANT_ID
```

Start on a staging deployment with `ZARINPAL_SANDBOX: "true"`; use the sandbox credentials/rules currently supplied by Zarinpal. Set `PAYMENTS_ENABLED: "true"` to test checkout on staging. Test successful, canceled and failed payments, duplicate callbacks, sold-out events and a free event. Confirm a member row, payment row and owner email. No live provider integration was executed while creating this package.

After successful sandbox tests, on production use the production merchant ID, `ZARINPAL_SANDBOX: "false"`, `PAYMENTS_ENABLED: "true"`, and redeploy. Confirm the first real low-value payment yourself before opening sales.

## 8. Updates, logs and export

- Commit code edits to GitHub. `npm run deploy` publishes your local changes. GitHub pushes alone do not redeploy the Worker unless you connect Workers Builds; see the full guide.
- Optional: connect the repository to Cloudflare Workers Builds after first deployment; build `npm ci`, deploy `npx wrangler deploy` (requires committed lockfile generated on your machine).
- `npm test` runs the supplied logic/database tests without installing dependencies.
- View Cloudflare invocation errors and Apps Script Executions privately. Do not print secrets/OTP codes.
- Outbox retries every 10 minutes; authenticated admin can request sync at `/#/admin`. Sheets writes are idempotent; rare mail retry after a delivery acknowledgment failure can repeat an email.
- Apps Script MailApp quotas apply to both OTP and owner notifications. Confirm the current quota for your account and migrate to a transactional mail provider as volume grows.
- Export Google Sheets via File → Download → Microsoft Excel (.xlsx). Keep backups of D1 and the sheet.
- Refunds, cancellations, account deletion and profile corrections are **manual support operations**, not automatic admin flows. A late payment without capacity becomes `refund_required`; contact the member and reconcile/refund through the gateway dashboard. Do not treat it as a seat confirmation. Follow `docs/OPERATIONS.md`.

## File map

| Location | Purpose |
|---|---|
| `site/` | All public frontend files |
| `site/config.js` | Public demo/live setting and public Turnstile site key |
| `site/assets/data.js` | Synthetic fixtures and filter logic |
| `backend/worker.mjs` | Auth, events, checkout, callback, outbox |
| `backend/schema.sql` | D1 schema |
| `google-apps-script/` | Signed Google Sheet/email bridge |
| `docs/` | Setup, operations, content template and test notes |
| `tests/` | Logic, access, capacity and settlement checks |
| `wrangler.jsonc` | Deployment configuration; no secrets |

## Provider documentation

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/services/quotas
- https://www.zarinpal.com/docs/paymentGateway/connectToGateway

This package is not deployed into your GitHub, Google or gateway account. Owner credentials/configuration and live acceptance testing are still required. Provider availability, commercial terms, quotas and regional eligibility must be checked in your own accounts.
