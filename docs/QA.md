# Verification — 21 October 2026

- All 16 Node tests pass. Tests cover composable map filters, Tehran dates, sample inventory, server pricing, capacity limits, repeat checkout, payment idempotency, late-payment refund handling, authentication gates and receipt ownership.
- Wrangler 4.151.3 deployment dry run succeeds; Worker bundling and asset configuration validated. No remote deployment performed.
- Browser inspection: Tehran tile map with 264 sample programs, filters, event details, account gate, synthetic demo account, simulated booking and receipt. No money charged or emails sent.
- Desktop layout and 390px-wide embedded mobile layout visually inspected. Mobile filters corrected to full-width search and two-column dropdowns.
- Persian content, local font and RTL layout included.

## Activation still required

Real email OTP delivery, Sheets synchronization, Turnstile, Cloudflare D1 production database and Zarinpal sandbox/merchant transactions require the owner's service credentials and deployment. They have not been tested against live accounts here. Follow SETUP_FA.html and perform the end-to-end launch checklist before enabling real bookings.

Legal policy drafts, coach profiles, photos, videos, real program details and cancellation policies must be completed by the owner. Sample pins use approximate coordinates, not real event venues. Google Sheets supports exporting the accumulated rows to Excel; the app does not generate a new .xlsx attachment per account.
