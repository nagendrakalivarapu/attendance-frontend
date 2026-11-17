# Routes

TanStack Router uses file based routing in this Vite React app. Route files use `.jsx` (or `.js` when a route contains no JSX) and live in this directory. The root layout is `src/routes/__root.jsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.jsx` | `/` |
| `about.jsx` | `/about` |
| `users/index.jsx` | `/users` |
| `users/$id.jsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.jsx` | `/posts/:category?` (optional segment) |
| `files/$.jsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.jsx` | layout route (renders children via `<Outlet />`) |
| `__root.jsx` | app shell — wraps every page; preserve `<Outlet />` |

`src/routeTree.gen.js` is generated during Vite development and builds. Do not edit it by hand.
