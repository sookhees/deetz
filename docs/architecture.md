# Architecture

How Deetz is set up and how a question gets answered.

[direction.md](direction.md) says how much of this exists today.
[decisions.md](decisions.md) says why it is built this way and what was
considered instead. Sign-in has its own page, [auth.md](auth.md).

## What it is

Deetz answers questions from a person's own Microsoft 365: their files,
SharePoint, mail, calendar and Teams, by voice or by text, running inside the
organisation's Azure tenant. It searches, reads a document if it needs to,
answers, and says where the answer came from.

Every call goes to Microsoft Graph as the signed-in person. Microsoft's index
does the searching and trims every result to what that person can already
open, so Deetz holds no copy of the organisation's content.

Anyone with an account in the tenant can use it, signing in with the Microsoft
account they already have.

## Setup

### The admin, once

1. **Install.** Run `azd up`. Bicep provisions the app, Postgres, the four
   Azure OpenAI deployments and Key Vault into the subscription the admin is
   signed into, creates the Entra app registration with the `Deetz.Admin` role
   assigned to them, and opens the admin page.
2. **Choose the apps.** The admin page lists what Deetz can read from, each
   with a switch:

   | App | What it gives people |
   | --- | --- |
   | SharePoint | Sites, pages, lists and the documents in them |
   | OneDrive | Their own files |
   | Outlook mail | Their inbox, and search across their mailbox |
   | Outlook calendar | What is on, when, and with whom |
   | Teams | Chats and channel messages they are in |
   | People | Who someone is, and who to ask |

   An app switched off here is off for everyone. There are no per-person
   switches.
3. **Consent.** One click, for exactly the delegated read scopes those apps
   need, listed in [auth.md](auth.md). Switching another app on later is one
   more click here.
4. **Set limits.** A daily spend ceiling, a per-person quota, and voice on or
   off. Defaults are pre-filled.
5. **Set the languages.** The organisation's main language, which decides how
   search queries are written, and the languages people may ask in.
6. **Name it.** The assistant's name, its tone, and one paragraph on what it
   is for. The rules about citing sources and refusing to guess are Deetz's
   own and stay fixed.
7. **Share the link.** On the intranet, in SharePoint, in Teams, or pinned to
   phones through Intune as a web link.

Who counts as admin, and how the role is checked, is in
[auth.md](auth.md#who-is-admin).

### The person

Entra signs them in, with no prompt if they are already signed in to
Microsoft 365, and they ask. What Deetz can read for them is what the admin
switched on, trimmed by Graph to what they can already open.

## Asking

1. They type, or tap to speak. Speech is transcribed on the server.
2. The server reads who they are from the session, checks their quota and the
   day's ceiling, and gives the model the functions for the apps that are
   switched on.
3. The model picks a function, composes a query, and Deetz sends it to Graph
   as that person. Microsoft ranks the results and trims them.
4. If the snippet is not enough, Deetz reads the document on the server, only
   the part that bears on the question.
5. The model answers and cites the document, with a link to it in
   Microsoft 365.
6. Spoken answers are read back sentence by sentence as they are written.
7. The turn is logged: the question, the queries the model formed, what came
   back, the citation, and a thumbs up or down if given.

## The agent and its functions

The model is the agent. We write the functions, it chooses between them and
writes the queries, and the AI SDK runs the loop.

### The functions

Eight of them. Seven fetch from one Graph endpoint each, with the entity type
fixed in the code, and one reads a document. Each shapes its results for the
model.

| Function | What it does | Graph call |
| --- | --- | --- |
| `searchSharePoint(query)` | Sites, pages, lists, documents | search, `driveItem` `listItem` `site` |
| `searchOneDrive(query)` | The person's own files | search, `driveItem` in their drive |
| `searchMail(query)` | Messages by sender, subject, words | search, `message` |
| `newMail()` | What has arrived since they last looked | inbox listing, unread, newest first |
| `searchTeams(query)` | Chats and channel messages they are in | search, `chatMessage` |
| `calendar(from, to)` | What is on in a date range | calendar view |
| `findPerson(query)` | Who someone is, their title and department | search, `person` |
| `readDocument(id, question)` | The passages of one result that bear on the question | content download or workbook API, text extracted on the server |

Six switches gate seven functions: the mail switch gates both `searchMail` and
`newMail`, and the other five gate one each. `readDocument` is offered
whenever any app is on.

A search function knows its endpoint and its entity type, and nothing about
the question beyond the query the model wrote. Graph lets files and sites
share one request but keeps mail, Teams and calendar apart, which is why the
searches split by app. `readDocument` is the exception that takes the
question, because choosing which passages to send is its job.

### What else we write

- **A description per function**, one paragraph, written to route rather than
  to describe. "Search Teams chats and channel messages. Use when the question
  is about a chat, a channel, or something someone said in Teams." This is the
  part that gets tuned.
- **The system prompt.** Who the assistant is, cite only what a tool returned,
  say so when nothing came back, keep spoken answers short, and what to do
  when asked for something it has no function for: say it cannot yet, and do
  the part it can.
- **The wiring.** Which functions are in the list, from the admin's switches.
  A function that is not in the list does not exist as far as the model is
  concerned, and the server refuses a call to a switched-off app even if one
  were attempted.

### Reading a document

Search finds the document; reading it is a second step, taken only when the
snippet is not enough. Graph returns a few highlighted lines around the match,
which answers where the Q3 budget is and often what a message said, but not
what a contract says about termination. So `readDocument` fetches the document
itself. At most two are read per question, held in memory, and discarded.

Where the text comes from depends on the type:

| Type | Read call | What reaches the model |
| --- | --- | --- |
| Mail, calendar, Teams, pages, lists | Graph | The response, as is |
| PowerPoint | Graph's content call with `?format=pdf` | Usually the whole thing |
| Word, PDF | Graph's content call with `?format=pdf` | The passages that bear on the question |
| Excel | Graph's workbook API | Rows from one table, capped, or one computed result |

The file extension decides the path. PowerPoint and the long text types share
the same conversion call and then split on length: anything under a few
thousand tokens goes whole, which slides almost always are, and anything
longer is ranked.

**Word and PDF** are the long ones. A hundred-page policy is around 65,000
tokens. It would fit the model's context and still produce a worse answer,
because the passage that matters is buried. So the server extracts the text
with one PDF library, cuts it into chunks of a few hundred tokens, embeds them
with the embedding deployment, and ranks them against the question with a
keyword boost. The top five to eight go to the model with their page numbers,
and the citation is the document plus the page.

**Excel** is not text and is never downloaded. A finance workbook can run to
millions of cells. The workbook API reads it like a database: list the sheets
and tables, read the header row, let the model choose a table and a filter,
fetch only those rows, capped, preferring a named table when there is one.
Sums and lookups run in Excel itself through the API's functions endpoint, or
in a small calculate step on the server. The model reads the result rather
than doing the arithmetic.

The extractor and the ranking sit behind `readDocument` and are swappable.

### What the model does

Given the list, it answers with a structured call instead of text. For "what
did Priya say in Teams about the budget?" its reply is:

```json
{ "name": "searchTeams", "arguments": { "query": "Priya budget" } }
```

Our code runs the function and hands the results back. The model then
answers, calls a second function if the first came up empty, reads a document
by id, or asks which of two apps the person meant.

Mail queries use the syntax of the Outlook search box, so the model can form
`from:priya budget` and get what a person would.

### Adding an app

One more row in the table: one function, one description, one switch on the
admin page, and its scope in the consent. Nothing above the function layer
changes.

## Under the hood

- Sign-in is Better Auth with Entra, asking for the Graph scopes at sign-in,
  with the person's tokens in Postgres and refreshed by the library. Details
  in [auth.md](auth.md).
- The chat call is the AI SDK's `streamText` with tools whose `execute` runs
  on the server. The person's Graph token reaches `execute` through the tools
  context, so the model never handles it.
- The number of steps per turn is capped in configuration, so the model can
  search again if the first query missed but cannot loop.
- The prompt is ordered so its stable parts come first, the system prompt and
  then the function definitions, because those are the same on every step of a
  turn and the model's prompt cache charges far less for a repeated prefix.
- Every number, date and name in an answer comes from a tool result in this
  conversation. If nothing useful came back, it says so.

## Voice and models

Four Azure OpenAI deployments in the organisation's subscription, reached
through the AI SDK's Azure provider by deployment name:

| Job | Deployment | AI SDK call |
| --- | --- | --- |
| Hear | a transcription model | `azure.transcription(...)` |
| Think | a chat model with tool calling | `azure(...)` |
| Speak | a text-to-speech model | `azure.speech(...)` |
| Rank | an embedding model | `azure.textEmbeddingModel(...)` |

The four deployment names are settings, not code. The admin sees them on the
admin page with the retirement date Azure reports for each, and changing one
is a settings change rather than a release. Deetz creates the Azure OpenAI
resource as a Foundry project, because one of the four models requires one,
and in whichever region has all four available.

A spoken turn is `transcribe()` then `streamText()` then `generateSpeech()`.
A typed turn touches the chat deployment, and the embedding one only when a
long document is read. Spoken replies are synthesised one sentence at a time
as the text streams and queued through one `<audio>` element created inside
the first tap, so the first sentence plays while the rest is still being
written.

The model's reasoning never reaches the screen or the speaker. Some chat
models emit reasoning as ordinary text rather than as a separate part, so the
transcript code and the speech queue filter it out rather than assuming the
provider has already separated it.

Token costs per turn feed the model-rates table that enforces the spend
ceiling.

## Languages

English and French, typed or spoken. Transcription detects which of the two
was said, the chat model reads it directly and, by a rule in the prompt,
answers in the language the person used. Speech follows the text.

The models handle more languages than two. Two is what the tests cover, so two
is what is claimed.

Two ports stay open so a third language is a row in a table rather than a
change to the code:

- `transcribe(audio, language?)`: the person's language as a hint, or
  auto-detect when unset.
- `speak(text, language)`: the voice picked from the language the answer is
  written in.

The person's language comes from their browser. The organisation's main
language, set once by the admin, decides one thing: how search queries are
written. Microsoft's index matches text, so a French question about an English
document needs an English query. The prompt says to write queries in the
organisation's main language, keep names as they appear, and try again in the
question's language if nothing comes back. The regression suite runs both
languages.

## Staying inside Graph's limits

A question costs one or two searches and at most two document reads. A person
may search ten times a second; Deetz may spend 1,250 SharePoint resource units
a minute in the smallest tenant tier, and a document read costs one unit. A
thousand people asking five questions a day use about one percent of that.

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
image. The app, the database and the vault go in whichever region the admin
picks; the Azure OpenAI resource goes where its four models are available,
which the install works out.

Every environment variable is read inside a function, never at import, so the
build needs none of them and CI runs without secrets.
