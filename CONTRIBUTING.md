# Contributing

Issues and pull requests are welcome. For anything larger than a fix, open an
issue first so the shape can be agreed before the work.

[architecture.md](docs/architecture.md) describes how Deetz works,
[decisions.md](docs/decisions.md) why it is built that way, and
[direction.md](docs/direction.md) what is built and what is not.

## What you need

The landing page needs nothing but Node and pnpm.

The product needs what it needs in production: a Microsoft 365 tenant and an
Azure OpenAI resource. Deetz is software for Microsoft 365 on Azure, and there
is no recorded or simulated Graph to develop against, because a recording
drifts from what Graph really returns and anyone changing a Graph call would
then be testing against a fiction. A Microsoft 365 Business trial is enough,
and a script in the repository populates a tenant with users, a site,
documents, mail and Teams messages. See [direction.md](docs/direction.md).

## Running it

```bash
pnpm install
pnpm dev
```

That starts both apps: the product on [localhost:3001](http://localhost:3001)
and the site on [localhost:3000](http://localhost:3000). To run one:

```bash
pnpm --filter deetz dev
pnpm --filter site dev
```

`pnpm typecheck`, `pnpm lint` and `pnpm build` run across the whole workspace,
and are what CI runs on every push.

## Layout

| Path | What it is |
| --- | --- |
| `apps/deetz` | The product. What `azd up` installs into a tenant. |
| `apps/site` | The landing page. |
| `packages/ui` | The shadcn components, theme tokens and styles both apps use. |
| `packages/typescript-config` | Shared TypeScript settings. |

Inside an app, everything about one feature lives under `features/<name>/`:
its components, hooks, library code, and a `content.ts` for its copy. Pages
under `app/` compose what a feature exports and stay small. An app's own
`components/` folder holds only that app's shared pieces; anything both apps
use belongs in `packages/ui`.

Add a shadcn component from inside an app, and the CLI puts it in the right
place:

```bash
cd apps/site && pnpm dlx shadcn@latest add button
```

## Conventions

- **Every commit leaves the repository building and running.** The history
  should read as a sequence, not a dump.
- **No environment variable is read at import**, only inside a function. This
  is what lets the build and CI run with no secrets.
- **No call site names a model.** The four jobs resolve deployment names from
  configuration.
- **Colours come from the theme tokens**, never hand-rolled greys.
- **Commit messages** follow Conventional Commits with a scope and a body that
  says why, not what.

## Stack

In the repository today: [Next.js](https://nextjs.org) with the App Router,
[React](https://react.dev), TypeScript, [Tailwind CSS](https://tailwindcss.com)
and [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)
primitives, [Phosphor](https://phosphoricons.com) icons, and
[pnpm](https://pnpm.io) with [Turborepo](https://turborepo.com). GitHub Actions
runs typecheck, lint and build on every push.

Arriving with the roadmap: the [AI SDK](https://ai-sdk.dev) on
[Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service),
[Microsoft Graph](https://learn.microsoft.com/graph), Postgres, and the
[Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli)
with Bicep templates.
