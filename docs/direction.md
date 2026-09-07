# Direction

What is being built, in what order, and how far along each part is.

This is not a roadmap and not a promise. It records the agreed direction so
that anyone reading the repository can tell what exists, what is committed,
and what is only a direction. Dates are deliberately absent.

Things that were considered and rejected are not here. They are in
[decisions.md](decisions.md), with the reason attached.

## Status terms

- **Building** — work has started and is in the repository.
- **Next** — committed, and the work has not started.
- **Later** — agreed that it should exist. Nothing is committed, and the shape
  may change.

## Direction at a glance

| Area | Direction | Status |
| --- | --- | --- |
| Landing page | A single page describing the project, on Vercel | Building |
| Development tenant | A script that populates a Microsoft 365 tenant, so anyone can run the product against real data | Next |
| Chat panel | A typed conversation: composer, transcript, streamed answers, citations | Next |
| Sign-in | Better Auth with Entra, sessions and tokens in Postgres, the `Deetz.Admin` role | Later |
| Search | The eight Graph functions and the agent loop that chooses between them | Later |
| Documents | Passage ranking for Word and PDF, table queries for Excel | Later |
| Limits | Per-person quotas, a daily spend ceiling, the turn log | Later |
| Voice | Transcription in, sentence-chunked speech out | Later |
| Install | `azd up`, Bicep templates, a Dockerfile, and the app registration | Later |
| Tests | An end-to-end browser suite | Later |
| Document cache | Chunks and vectors in the same Postgres, behind an admin switch, and only if reopening long documents proves slow in practice | Later |
| Sending | Mail and Teams messages drafted by the model, sent only when a person confirms, behind scopes that are off by default | Later |
| Uploads | Documents a person adds, into the same vector store | Later |
| Teams app | A tab, which gets its token from Teams and exchanges it for a Graph token on behalf of the person | Later |
| Sign-out everywhere | Front-channel logout to Entra, so signing out of Deetz can also end the Microsoft session | Later |
| Own systems | An organisation's own systems reached as MCP servers | Later |
| API | The same ask endpoint, for an organisation's own applications | Later |

## How the first pieces get built

The chat panel comes before sign-in so that the conversation can be worked on
without a tenant. Sign-in comes before search because every Graph call needs a
token, and the first call against a real tenant is what proves the token
carries the scopes it should.

Sign-in, in order:

1. Postgres locally, the Drizzle adapter, and Better Auth's generated schema.
2. `features/auth` in `apps/deetz`: the Microsoft provider, the route handler,
   and a guard on the chat API.
3. A signed-out state with one button.
4. `getGraphToken()`, then a call to `/me` to prove the token is real, then the
   Search API.
5. The `Deetz.Admin` role, read from the claim and checked on the admin page.
6. The certificate path, verified against the development tenant.
7. `.env.example` covering both credential paths.

## Not planned

Some things are deliberately not on this list. The reasons are in
[decisions.md](decisions.md).
