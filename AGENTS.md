<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- This app is a frontend for the school's own Spring Boot API and FastAPI face service; all data goes through `src/lib/api.ts` (bearer token from localStorage), never a Lovable Cloud database — the backend lives outside this repo.
- Server addresses come from `VITE_API_URL` / `VITE_FACE_API_URL` with a per-browser override in `src/lib/server-config.ts` — each campus runs its own servers.
- Role areas are layout routes (`admin.tsx`, `teacher.tsx`, `student.tsx`) wrapped in `RoleLayout`; pages fetch with TanStack Query inside the gate because the session only exists client-side.
- Sidebar items and quick search share one source, `src/components/app/nav.ts` — add a page there when adding a route.
- Shared UI building blocks (Panel, StatCard, AttendanceMeter, NativeSelect, ConfirmDialog) live in `src/components/app/primitives.tsx`; reuse them instead of ad hoc styling.
