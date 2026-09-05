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

1. Continuous integration
2. The widget shell, composer and transcript
3. The agent route and system prompt
4. Voice: transcription in, sentence-chunked speech out
5. Self-service setup: `azd up`, Bicep templates, a Dockerfile
6. The end-to-end browser suite

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
