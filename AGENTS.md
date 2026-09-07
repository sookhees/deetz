# Deetz

An assistant that answers questions from a person's own Microsoft 365 through
Microsoft Graph, installed into the customer's own Azure tenant.

The human documentation is the source of truth. Read it rather than restating
it here.

- [docs/architecture.md](docs/architecture.md) — how it works
- [docs/decisions.md](docs/decisions.md) — why, and what was rejected
- [docs/direction.md](docs/direction.md) — what exists and what does not
- [docs/auth.md](docs/auth.md) — sign-in and Graph tokens
- [CONTRIBUTING.md](CONTRIBUTING.md) — running it, layout, conventions

## Layout

| Path | What it is |
| --- | --- |
| `apps/deetz` | The product. What `azd up` installs into a tenant. |
| `apps/site` | The landing page. |
| `packages/ui` | Shared components, theme tokens, `globals.css`. |
| `packages/typescript-config` | Shared TypeScript settings. |

Everything about one feature goes under `features/<name>/` inside an app, with
its own `components/`, `lib/` and `content.ts`. Pages under `app/` compose what
a feature exports. An app's `components/` holds only that app's shared pieces;
anything both apps use goes in `packages/ui`. Add shadcn components from
inside an app so the CLI routes them correctly.

## Commands

```bash
pnpm dev                    # both apps
pnpm --filter deetz dev     # the product, port 3001
pnpm --filter site dev      # the site, port 3000
pnpm typecheck && pnpm lint && pnpm build
```

## Constraints

These are not visible from the code and are easy to break.

- No environment variable is read at import, only inside a function. The build
  and CI run with no secrets.
- No call site names a model. The four jobs resolve deployment names from
  configuration.
- Colours come from the theme tokens in `packages/ui`, never hand-rolled greys.
- Every commit leaves the repository building and running.

## Do not build

Each of these was decided against, with reasons in
[docs/decisions.md](docs/decisions.md).

- No index of the tenant's content, and no search service of our own.
- No widget for pages Deetz does not serve.
- Nothing hosted by this project except the landing page.
- No recorded or simulated Graph responses to develop against.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
