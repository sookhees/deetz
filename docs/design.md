# Deetz, first version

What Deetz is, how it is set up, and how a question is answered. Written before
most of the code, so where the code disagrees, the code is right and this file
needs updating. Sign-in has its own page: [auth.md](auth.md).

## What it is

Stop searching, start asking. Deetz answers questions from a person's own
Microsoft 365, their files, SharePoint, mail, calendar and Teams, by voice or by text,
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
3. **Choose the apps.** The admin is whoever holds the `Deetz.Admin` app
   role, which the install creates on the app registration and the admin
   assigns to themselves or to a group in Entra. The token carries it as a
   claim, Deetz checks the claim, and it is revoked where it was granted.
   The admin page lists what Deetz can read from, each with a switch:

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

## The agent and its functions

The model is the agent in the middle. We write the functions, one per app,
each small and fixed. The model chooses between them and writes the query.
The AI SDK runs the loop.

### What we write

Eight functions. Each is one Graph request with the entity type hard-coded,
and each returns its results shaped for the model.

| Function | What it does | Graph call |
| --- | --- | --- |
| `searchSharePoint(query)` | Sites, pages, lists, documents | search, `driveItem` `listItem` `site` |
| `searchOneDrive(query)` | The person's own files | search, `driveItem` in their drive |
| `searchMail(query)` | Messages by sender, subject, words | search, `message` |
| `newMail()` | What has arrived since they last looked | inbox listing, unread, newest first |
| `searchTeams(query)` | Chats and channel messages they are in | search, `chatMessage` |
| `calendar(from, to)` | What is on in a date range | calendar view |
| `findPerson(query)` | Who someone is, their role, their manager | search, `person` |
| `readDocument(id)` | Full text of one result, after a search | file download, text extracted on the server |

A function knows its endpoint and its entity type. It knows nothing about the
question. Graph only lets some entity types share one request, files and
sites together but mail, Teams and calendar each on their own, which is why
one function per app is the natural shape.

### Reading a document

Search finds the document; reading it is a second step, taken only when the
snippet is not enough. Nothing is indexed by us. One document is fetched per
question, read in memory, and discarded.

Where the text comes from depends on the app:

| App | Read call | Text from |
| --- | --- | --- |
| Mail, calendar, Teams | Graph | the response |
| SharePoint pages, lists | Graph | the response |
| Excel | Graph's workbook API | the response, as rows |
| Word, PowerPoint, PDF | Graph's content call with `?format=pdf` | one PDF text library on the server |

Graph converts Word and PowerPoint to PDF server-side on that call, so the
server needs a single extractor, chosen when the code is written and
swappable behind `readDocument`. The Copilot Retrieval API would return text
extracts through Graph directly, but it needs a Copilot seat per person, so
it is not used.

A long document never goes to the model whole. The passages around the
search terms go, capped at a few thousand tokens, and the citation still
points at the document. Spreadsheets go as rows, capped, preferring a named
table when there is one. Any arithmetic over them is done by code, either
Excel's own functions through the workbook API or a small calculate step on
the server, and the model reads the result. It never does the adding.

Beyond the functions, three things:

- **A description per function**, one paragraph, written to route rather
  than to describe. "Search Teams chats and channel messages. Use when the
  question is about a chat, a channel, or something someone said in Teams."
  This is the part that gets tuned.
- **The system prompt.** Who the assistant is, cite only what a tool
  returned, say so when nothing came back, keep spoken answers short, and
  what to do when asked for something it has no function for: say it cannot
  yet, and do the part it can.
- **The wiring.** Which functions are in the list for this person, from
  their switches and the admin's. A function that is not in the list does
  not exist as far as the model is concerned.

### What the model does

Given the list, it can answer a question with a structured call instead of
text. For "what did Priya say in Teams about the budget?" its reply is:

```json
{ "name": "searchTeams", "arguments": { "query": "Priya budget" } }
```

It picked the function whose description fitted, and it composed the query.
No code of ours reads the question or decides which app it is about. Our
code runs the function, hands the results back, and the model either
answers, calls a second function if the first came up empty, reads a
document by id, or asks which of two apps the person meant.

Mail queries use the syntax of the Outlook search box, so the model can form
`from:priya budget` and get what a person would.

### Adding an app

One more row in the table: one function, one description, one switch on the
admin page and the person's page. Nothing above the function layer changes,
which is also what lets a Microsoft-provided tool server replace a function
behind a switch one day without anything else noticing.

## Under the hood

- Sign-in is Better Auth with Entra, asking for the Graph scopes at sign-in,
  with the person's tokens in Postgres and refreshed by the library. Details
  in [auth.md](auth.md).
- The chat call is the AI SDK's `streamText` with tools whose `execute` runs
  on the server. The person's Graph token reaches `execute` through the tools
  context. The model has no field it could put a token in.
- A few steps per turn are allowed, so the model can search again if the first
  query missed.
- Every number, date and name in an answer comes from a tool result in this
  conversation. If nothing useful came back, it says so.

## Voice and models

Azure OpenAI only. Three deployments in the organisation's subscription, all
reached through the AI SDK's Azure provider by deployment name, so no call
site names a model and the browser can never choose one:

| Job | Deployment | AI SDK call |
| --- | --- | --- |
| Hear | `gpt-4o-mini-transcribe` | `azure.transcription(...)` |
| Think | the chat model: gpt-oss-120b by default, or a stronger model where a language or the routing needs it | `azure(...)` |
| Speak | `gpt-4o-mini-tts` | `azure.speech(...)` |

A spoken turn is `transcribe()` then `streamText()` then `generateSpeech()`,
each a stable API. A typed turn touches only the chat deployment. Spoken
replies are synthesised one sentence at a time as the text streams and
queued through one `<audio>` element created inside the first tap, so the
first sentence plays while the rest is still being written.

The chat model's reasoning is filtered before display and before speech. On
Azure, gpt-oss can emit its reasoning as ordinary text rather than as a
reasoning part; the transcript code and the speech queue treat it as such.

Cost, from Azure's retail prices for a global deployment: gpt-oss-120b is
$0.15 in and $0.60 out per million tokens; transcription is about $0.003 a
minute of audio; speech is about $0.015 a minute of audio. A typed question
with about 5,000 tokens of prompt, tools, history and results comes to about
a tenth of a cent; a spoken one with a fifteen-second reply to about half a
cent, two thirds of it the speech. That is roughly half the cost of the
realtime mini model and a sixth of the full one, which is why the limits
degrade voice before text. These are the numbers behind the model-rates
table that enforces the spend ceiling.

The voice turn is one port: speak a question, hear the answer. The pipeline
sits behind it.

## Languages

Hearing and answering come free with the models: transcription detects the
language spoken, the chat model reads it directly and, by a rule in the
prompt, answers in the language the person used. Its internal reasoning is
mostly English whatever the input, which nobody sees. Speech follows the
text. Coverage is strong in the thirty or so major languages, usable in about
a hundred, and weaker beyond, and speech quality lags text in the smaller
ones.

Three ports stay open so a language is a row in a table rather than code:

- `transcribe(audio, language?)`: the Azure OpenAI model now, with the
  person's language as a hint or auto-detect when unset.
- `speak(text, language)`: the Azure OpenAI voice now. Azure AI Speech is
  not an AI SDK provider, but its interfaces are one method each, so a
  dedicated voice for a language is a small adapter behind the same call.
- `answer(...)`: the chat deployment through the registry, a per-deployment
  choice.

The language table has one row per language: code, recognition locale,
voice, screen-strings file. The admin sets the organisation's main language
once and ticks which rows are on. The person's language comes from their
browser or their setting, with "auto" for people who switch mid-conversation.

The one place language has to be managed is the search query. Microsoft's
index matches text, so a Punjabi question about an English document needs an
English query. The prompt says: write search queries in the organisation's
main language, keep names as they appear, and if nothing comes back, try
again in the question's language. The regression suite gets a column per
enabled language, so the answer-language rule and the query rule are proved
per language rather than assumed.

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

The repo is a workspace: `apps/deetz` is the product, `apps/site` is the
landing page, and `packages/ui` is the design system both share, so a customer
who clones the repo gets the product and the two cannot drift in look.

The product runs on Azure Container Apps, Postgres, Azure OpenAI and Key
Vault, provisioned by `azd up` from Bicep templates. A Dockerfile and
`output: "standalone"` make the image. The site runs on Vercel until there is
a tenant to point a demo at. Every environment variable is read inside a
function, never at import, so the build needs none of them and CI runs
without secrets.

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

## Next

A Microsoft 365 tenant to develop against. Creating it and attaching a
Microsoft 365 licence is a portal step. Everything after is a script in the
repo: a few users, a team site with some documents, a couple of mailbox
messages, the app registration with its permissions and consent. Anyone with
a tenant can run it, which is how a contributor gets a working copy.
