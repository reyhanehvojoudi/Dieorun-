# Operations / نگهداری

## Before first sale

Complete organizer legal identity, real venue addresses, verified coach credentials, terms of attendance, cancellation cutoffs, refund amounts/timing, age rules, insurance and data retention. Test provider availability and the entire sandbox flow in the owner's accounts. Do not enable sales merely because the UI works.

## Event updates

Visit `/#/admin` while signed in using an address listed in `ADMIN_EMAILS`. Paste a complete valid event JSON, confirm review and submit. Do not change the meaning of an event ID after tickets have been sold; create a new ID for a new date. Turning off `published` stops new bookings but does not cancel existing orders.

## Payment state meanings

| State | Meaning | Operator action |
|---|---|---|
| pending | 20-minute checkout hold; not a ticket | Await gateway verification |
| paid | Gateway independently verified; seat confirmed | Honor the registration |
| free | Server reserved a free seat | Honor the registration |
| failed | Payment-request initialization failed | Customer can retry |
| expired | Hold expired; no confirmed ticket | Verify any reported bank payment before action |
| refund_required | Verified money arrived after the seat was reassigned or customer already has another active order | Contact customer, reconcile and refund manually; do not promise a seat |
| refunded | Operator recorded a completed refund | Keep reference and operator evidence |

The return URL's Status=OK is NOT proof of payment. Only the gateway verify response is used. Callbacks 100 and 101 are accepted idempotently. A scheduled reconciliation checks pending/expired authorities from the last day, oldest checked first, 30 per run. For older reports or traffic beyond this starter's batch capacity, use the authenticated receipt recheck, gateway dashboard and your operational process; scale the reconciler before growing traffic.

## Refunds and cancellations

This starter intentionally has no automatic refund API. Verify payer, order, policy and gateway transaction in the private dashboards. Execute the refund in the gateway dashboard, save evidence and update the D1 order to `refunded` using an authenticated administrator's dashboard or a reviewed migration. Update the corresponding private spreadsheet rows manually. Do not edit rows to simulate a gateway success. Do not delete financial records without an applicable retention policy.

## Data corrections / deletion

Use the support channel and verify the requesting account. Update/delete in D1 and corresponding Google Sheet copies; invalidate all sessions for a deleted account. Remove/retire OTP records. Financial-history retention may require anonymization rather than deletion. No public API can export the full membership database.

## Email and Sheets

New account and payment events are inserted into an outbox alongside the database state transition. A 10-minute cron retries failed deliveries; each event uses a stable delivery ID. Sheet rows are upserted by stable account/order IDs. MailApp has no provider idempotency token, so a crash after sending but before acknowledgment can rarely duplicate a notification.

A missing owner email does not mean payment failed; consult authoritative D1/gateway state. Check Cloudflare scheduled executions, private Apps Script Executions, MailApp quota, deployment version and identical bridge secrets. The admin sync button retries the queue without changing payment statuses.

No personal information or raw OTP is logged intentionally by this code. Keep logs private, and never add request-body debug logging to auth endpoints.

## Traffic and providers

The bundle is a starting implementation, not a claim of an audited or load-tested payment service. Test live infrastructure before launch. Review Cloudflare/D1, Google Apps Script and map provider quotas; daily email quota is shared by login codes and owner notifications. For significant membership growth replace Apps Script email with a transactional provider, process outbox with a queue, add monitoring and use a suitable tile service. Keep OpenStreetMap attribution.

## Secrets and release

Only public keys/settings belong in `site/config.js`. Secrets must be Cloudflare secrets or Apps Script properties. `.dev.vars` and `.env` are excluded by `.gitignore`; verify before every commit. Credentials are not included in the ZIP.

Use a separate staging Worker/D1/sheet and sandbox gateway. Keep GitHub Pages in demo mode, even if production switches to live. Manual deployment is `npm run deploy`; repository commits alone do not publish unless Workers Builds is connected.
