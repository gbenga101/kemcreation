<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Kem's Creation architecture
- Keep the public experience in its own shared shell and the owner experience under `/owner`; this separates customer discovery from operational workflows.
- Treat the owner area as an explicitly non-operational Stage 1 preview until authentication and persistent records are introduced; a public route must never expose real customer information.
- Centralize temporary visual tokens in `src/styles.css` and reusable controls under `src/components`; this keeps future brand replacement and later booking stages localized.
- Owner access is the `owner` role in `user_roles`; the first signed-in account claims it via `claim_owner()` and owner data is read with the browser client under RLS — keeps privileged access server-enforced without extra server functions.
- Blocked availability lives in `blocked_slots` and is enforced inside `get_booked_slots`/`create_booking` — the public calendar and the database agree on what is bookable.
- Visit reminders run from one shared server routine (`runReminders`) invoked by a daily cron hook route and an owner-only server function; `reminder_sent_at` guarantees at most one reminder per appointment.
- Deposits are recorded as `payment_status` (`not_required` → `pending` → `paid`) and only flipped to `paid` after server-side Paystack verification (signed webhook or verify API) — the Paystack redirect page alone is never trusted; the Paystack key stays server-only in `payments.functions.ts` and the webhook route.
