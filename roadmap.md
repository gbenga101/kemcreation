# Stage 1
- [x] Review four supplied planning documents and distinguish verified facts from proposed/demo content.
- [x] Establish temporary editorial design tokens and reusable interface elements.
- [x] Build responsive public pages and separate owner shell/dashboard with empty states.
- [x] Verify route rendering and responsive layouts.

# Stage 1 visual refinement
- [x] Keep the full-width photo hero; soften its overlay and remove the colored wordmark period.
- [x] Keep the three homepage categories; remove numbering, arrows, and rigid tile framing.
- [x] Remove the homepage location icon and use editorial text and subtle dividers.
- [x] Check the homepage across screen sizes without changing routes or owner workflows.

# Stage 3 — booking
- [x] Bookings saved in Lovable Cloud (customers, appointments), pending + slot held
- [x] 4-step /book flow with confirmation and reference

# Stage 4/5 — owner
- [x] Navbar Book Appointment button (desktop + mobile menu)
- [x] Owner sign-in at /owner/login; /owner restricted to owner role
- [x] Overview: summary, pending requests, today, upcoming
- [x] Appointments list with filters and status actions
- [x] Availability blocks hidden from /book

# Stage 7 — Paystack test-mode deposit
- [x] Deposit choice on the /book review step (₦5,000 demo amount; email required to pay online)
- [x] Test checkout via Paystack; server-side verification before "paid" (webhook + verify fallback)
- [x] Deposit status and pay-later option on Manage your booking; verify on return from Paystack
- [x] Owner cards show deposit state; "Paid Deposits" filter on the Appointments tab
