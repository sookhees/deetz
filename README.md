# Deetz

An AI assistant that answers questions from your organisation's own Microsoft 365
content, running entirely inside your Azure tenant. No Copilot licence, no per-seat
cost, and no data leaving the tenant.

**Status: nothing to install yet.** Deetz is being built in public, one working
commit at a time, from a private prototype. What is here today is a Next.js
scaffold that starts. The rest of this page says where it is going.

## What it will be

- **Embeddable.** A chat widget you drop onto an existing site or intranet page,
  not a platform you migrate to.
- **Answers from your content.** Questions resolve against SharePoint, OneDrive
  and mail through Microsoft Graph, as the signed-in person, so it sees exactly
  what they can see. Nothing is copied out or indexed somewhere else.
- **Voice and text.** Tap to speak, or type. One conversation either way.
- **Installs in minutes.** One `azd up` provisions everything into the Azure
  subscription the admin is signed into, including the Azure OpenAI deployments.
  Time to first answer is the number this project is measured on.
- **Carries its own limits.** Per-caller rate limits, a daily spend ceiling and
  per-user quotas live in the app itself, so what `azd up` installs is safe to
  expose without a gateway in front of it.

## Roadmap

Roughly in the order it will land:

1. The widget shell, composer and transcript
2. The agent route and system prompt
3. Voice: transcription in, sentence-chunked speech out
4. Self-service setup: `azd up`, Bicep templates, a Dockerfile
5. The end-to-end browser suite

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
