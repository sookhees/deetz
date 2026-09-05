# Deetz

Stop searching. Start asking. Deetz answers questions from a person's own Microsoft 365,
their files, SharePoint, mail, calendar and Teams, by voice or by text, running
inside the organisation's Azure tenant. No Copilot licence, no per-seat cost, and
nothing leaves.

**Status: nothing to install yet.** Deetz is being built in public, one working
commit at a time, from a private prototype. What is here today is the landing
page. [docs/design.md](docs/design.md) says how the rest works, and
[docs/auth.md](docs/auth.md) covers sign-in.

## What it will be

- **Your own Microsoft 365.** It searches through Microsoft's own index, reads
  the document if it needs to, and cites what it used. Nothing is crawled,
  indexed elsewhere or copied out.
- **Sees what you see.** Every search runs as the signed-in person, so their
  permissions are the boundary.
- **The admin chooses the apps, the person chooses theirs.** The admin switches
  on SharePoint, OneDrive, mail, calendar, Teams and people for the
  organisation. Each person picks everything or a subset on first sign-in.
  Mail is off until they turn it on.
- **Speak or type.** Tap to talk and hear the answer read back as it is
  written. One conversation either way, on a laptop or a phone.
- **Runs in your tenant.** One `azd up` provisions the app and its Azure OpenAI
  deployments into the subscription the admin is signed into, with a spend
  ceiling and per-person quotas built in. You pay for tokens, not seats.

## Roadmap

In the order it will land:

1. The chat panel, typed
2. Sign-in with Microsoft Entra
3. Search over your Microsoft 365 through Graph
4. Voice: transcription in, sentence-chunked speech out
5. Self-service install: `azd up`, Bicep templates, a Dockerfile
6. The end-to-end browser suite

## Tech stack

In the repo today:

- [Next.js](https://nextjs.org) 16 with the App Router, [React](https://react.dev) 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4 and [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) primitives, with [Phosphor](https://phosphoricons.com) icons and `next-themes` for light and dark
- [pnpm](https://pnpm.io), ESLint and Prettier
- GitHub Actions for typecheck, lint and build on every push, with Dependabot keeping dependencies current
- [Vercel](https://vercel.com) for the public demo

Arriving with the roadmap:

- [Vercel AI SDK](https://ai-sdk.dev) on [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service): one deployment each for chat, transcription and speech, all resolved server-side
- [Microsoft Graph](https://learn.microsoft.com/graph) for the organisation's content, called as the signed-in person
- Postgres for rate limits, spend ceilings and per-user quotas, so more than one container shares one set of counters
- Azure Blob Storage behind a small storage adapter, with Vercel Blob as the second implementation for the demo
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli) with Bicep templates, plus a Dockerfile for Azure Container Apps
- [Puppeteer](https://pptr.dev) driving headless Chrome for the end-to-end suite

## Running the scaffold

```bash
pnpm install
pnpm dev
```

Opens on [http://localhost:3000](http://localhost:3000). It is a placeholder page.

## Contributing

Every commit leaves the repo building and running, so the history reads as a
sequence rather than a dump. Issues and pull requests are welcome. For anything
larger than a fix, open an issue first so the shape can be agreed before the work.

## Licence

[MIT](LICENSE).
