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
