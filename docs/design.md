# Deetz, first version

What Deetz is, how it is set up, and how a question is answered. Written before
most of the code, so where the code disagrees, the code is right and this file
needs updating. Sign-in has its own page: [auth.md](auth.md).

## What it is

Talk to your business. Deetz answers questions from a person's own Microsoft
365, their files, SharePoint, mail, calendar and Teams, by voice or by text,
running inside the organisation's Azure tenant. It searches what the person can
already see, reads the document if it needs to, answers, and says where the
answer came from.

It runs straight on Microsoft Graph, as the signed-in person. Microsoft's own
index does the searching and the permission trimming, so there is nothing to
crawl, nothing to index and nothing copied out.

## Who uses it

Anyone with an account in the tenant. Everyone signs in with the Microsoft
account they already have.

## Setup

### The admin, once

1. **Install.** Run `azd up`. Bicep provisions the app, Postgres, the three
   Azure OpenAI deployments (chat, transcription, speech), Key Vault and
   storage into the subscription they are signed into, creates the Entra app
   registration, and prints one consent link.
2. **Consent.** One click, for the delegated read scopes listed in
   [auth.md](auth.md). Every scope is "as the signed-in person".
3. **Choose the apps.** The admin page lists what Deetz can read from, each
   with a switch:

   | App | What it gives people |
   | --- | --- |
   | SharePoint | Sites, pages, lists and the documents in them |
   | OneDrive | Their own files |
   | Outlook mail | Their inbox, and search across their mailbox |
   | Outlook calendar | What is on, when, and with whom |
   | Teams | Chats and channel messages they are in |
   | People | Who someone is, and who to ask |

   An app switched off here is off for everyone.
4. **Set limits.** A daily spend ceiling, a per-person quota, and voice on or
   off. Defaults are pre-filled.
5. **Name it.** The assistant's name, its tone, and one paragraph on what it
   is for. The rules about citing sources and refusing to guess are Deetz's
   own and stay fixed.
6. **Share the link.** On the intranet, in SharePoint, in Teams, or pinned to
   phones through Intune as a web link.

### The person, first time

Entra signs them in, with no prompt if they are already signed in to
Microsoft 365. Deetz shows one screen: *what should I be able to read for
you?* The apps the admin allowed, with two choices:

- **Everything.** One tap. All the allowed apps, on.
- **Pick.** A switch per app.

Mail starts off in either case, and they turn it on if they want it. The
choice is saved to their account and lives in their settings from then on.

## Asking

1. They type, or tap to speak. Speech is transcribed on the server.
2. The server reads who they are from the session, checks their quota and the
   day's ceiling, and gives the model one tool per app they have on.
3. The model picks a tool, composes a query, and Deetz sends it to Graph's
   search endpoint as that person. Microsoft ranks the results and trims them
   to what the person can open.
4. If the snippet is not enough, Deetz fetches the document and extracts its
   text on the server.
5. The model answers and cites the document, with a link to it in
   Microsoft 365.
6. Spoken answers are read back sentence by sentence as they are written.
7. The turn is logged: the question, the queries the model formed, what came
   back, the citation, and a thumbs up or down if given.

## Apps are tools

Each app is one tool with a description Deetz wrote. The model routes on the
description and composes the query itself.

| App | Graph call |
| --- | --- |
| SharePoint | Search, `site` and `listItem` and `driveItem` |
| OneDrive | Search, `driveItem` in the person's drive |
| Outlook mail | Search, `message`; inbox listing filtered to unread for "anything new" |
| Outlook calendar | Calendar view for a date range |
| Teams | Search, `chatMessage` |
| People | Search, `person` |

Mail queries use the syntax of the Outlook search box, so the model can form
`from:priya budget` and get what a person would. One more tool reads a
document by id after a search.

An app that is off, for the person or for the organisation, is a tool the
model never sees. It cannot call what it cannot see, so it never offers it.

## Under the hood

- Sign-in is Better Auth with Entra, asking for the Graph scopes at sign-in,
  with the person's tokens in Postgres and refreshed by the library. Details
  in [auth.md](auth.md).
- The chat call is the AI SDK's `streamText` with tools whose `execute` runs
  on the server. The person's Graph token reaches `execute` through the tools
  context. The model has no field it could put a token in.
- Transcription, chat and speech are resolved through a provider registry so
  no call site names a model, and the browser can never choose one.
- A few steps per turn are allowed, so the model can search again if the first
  query missed.
- Every number, date and name in an answer comes from a tool result in this
  conversation. If nothing useful came back, it says so.
- Spoken replies are synthesised per sentence and queued through one `<audio>`
  element created inside the first tap.

## Staying inside Graph's limits

A question costs one or two searches and at most two document reads. A person
may search ten times a second, an app may spend 1,250 SharePoint resource
units a minute in the smallest tenant tier, and a document read costs one
unit. A thousand people asking five questions a day use about one percent of
that.

Four rules keep it there: honour `Retry-After` on a 429 and never retry
automatically; run tool calls one at a time per person; read at most two
documents per question; send a decorated User-Agent,
`ISV|Deetz|Deetz/<version>`.

## Limits and logs

All in the app, all in Postgres.

- Per-person quota, with a per-person override the admin can set.
- Daily spend ceiling from a model-rates table and the tokens each turn used.
- Per-IP rate limit as anti-abuse.
- Metered in cost, shown in questions: "12 questions left today".
- At the limit, voice goes first and text keeps working.
- The turn log is the admin's tuning list, sorted by "found nothing" and
  "thumbs down". It holds people's questions, so it stays in their Postgres,
  is visible only to admins, and has a retention setting.

## Where it runs

Azure Container Apps, Postgres, Azure OpenAI and Key Vault, provisioned by
`azd up` from Bicep templates. A Dockerfile and `output: "standalone"` make the
image. The public demo is this landing page on Vercel until there is a tenant
to point it at. Every environment variable is read inside a function, never at
import, so the build needs none of them and CI runs without secrets.

## Later, in rough order

1. Sending mail and Teams messages: drafted by the model, sent only when the
   person presses Send, behind separate scopes that are off by default.
2. Uploaded documents, indexed into pgvector in the same Postgres.
3. A Teams app, through Teams single sign-on and on-behalf-of.
4. The organisation's own systems as MCP servers, added by URL, called with a
   token for the signed-in person.
5. An API for the organisation's own apps: the same `/api/ask`, taking a token
   issued to the person for Deetz.
6. A widget for pages outside Deetz's domain, as an iframe with a small
   loader.
7. A native phone app as a thin wrapper, if anyone needs push notifications.
   Until then the browser is the phone app.

## Open questions

- A Microsoft 365 tenant to develop against, with a few users, some SharePoint
  content and mailboxes. Creating it is a portal step; populating it is
  scripted.
- Which library extracts text from Word, PowerPoint and PDF on the server, and
  how much of a long document to hand the model.
- How the admin is identified: the first person in, or an Entra group named at
  install.
