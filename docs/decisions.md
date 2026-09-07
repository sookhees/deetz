# Decisions

Why Deetz is built the way it is, and what was considered instead. Each entry
records the alternative that was rejected and what the decision costs, so that
a reader can disagree with the reasoning rather than only with the result.

A decision here is not permanent. It is a record of what was agreed and why,
so that changing it is a deliberate act.

## Microsoft's index, not our own

Enterprise search products copy an organisation's content into an index they
control and answer from the copy. Deetz calls Graph's search at the moment a
question is asked. Considered and rejected: building an index of the tenant's
content and answering from that.

Microsoft already indexes every file, message and event in the tenant, and
trims results to what the asker is allowed to open. Rebuilding that means
crawling, copying, keeping the copy fresh, and re-implementing permission
trimming.

**Costs:** ranking is Microsoft's, not ours. Graph's throttling limits apply.
Only Microsoft 365 content is reachable.

## No index of the tenant's content, ever

Distinct from the above, and stronger. Later versions add a vector store for
documents people upload and for passages of documents people have opened. That
store holds only what someone put there or read. Nothing is crawled ahead of a
question, in any version.

**Costs:** a question about a document nobody has opened is answered from
Graph's snippet, not from the whole text.

## Delegated tokens, not app-only

Every Graph call is made as the person asking, using their token. Considered
and rejected: an application identity with access to libraries the admin
names, which would let Deetz answer for people who are not signed in.

Permissions are then Microsoft's problem rather than ours, and there is no way
for an answer to include something the asker could not have found themselves.

**Costs:** no anonymous use. Nothing can be fetched or prepared before someone
asks.

## Sign-in uses Better Auth

Better Auth keeps the provider's access and refresh tokens in the database and
refreshes them itself, so asking for a Graph token is one call. Its Microsoft
provider takes a client assertion, so a certificate works the same way a
secret does. It is a stable release line with a database at its centre, which
is where Deetz was going anyway.

Sign-in runs on the server, so nothing hosted elsewhere holds identity data.

**Costs:** a younger project than the long-established alternatives, and one
more library whose releases have to be followed.

## Documents are fetched and extracted, not looked up

Search returns a snippet. When the snippet is not enough, Deetz downloads the
document and extracts the text on the server. Microsoft's index already holds
that text, but reaching it needs a Copilot licence for every person, which
Deetz does not assume anyone has.

**Costs:** more code, and slower than an index lookup would be.

## One model provider

Chat, transcription, speech and embeddings are all Azure OpenAI deployments,
reached through one provider with one key. Considered: a second, dedicated
speech service for wider voice coverage.

**Costs:** the resource can only live where all four models are available,
which is fewer regions than any one of them alone.

## No call site names a model

Each of the four jobs resolves a deployment name from configuration at request
time. Nothing in the code, and nothing the browser sends, names a model.

**Costs:** none worth stating. This is what makes a model retirement a
settings change rather than a release.

## Reads only, in the first version

Considered: drafting and sending mail and Teams messages, behind a
confirmation. Deferred rather than rejected; it is in
[direction.md](direction.md).

**Costs:** someone who wants a reply written still writes it.

## The admin chooses the apps, the person does not

Six switches, set once for the whole organisation. Considered and rejected: a
screen at first sign-in where each person picks which apps Deetz may read for
them.

Every switch a person can set is a thing they can set wrongly, and a thing to
explain. Graph already trims every result to what they can see, so the
per-person control was protecting nothing.

**Costs:** a person who wants their mail left out of their own answers cannot
arrange that.

## English and French

The models handle more languages than two. Two is what the tests cover, so two
is what is claimed. Microsoft publishes no language list for these models, so
a wider claim could not be sourced.

**Costs:** a third language needs a row in a table and a test, not a code
change, but it does need someone to add them.

## No widget

Considered and rejected: an iframe and a loader script so that Deetz could
appear on pages it does not serve. Deetz is one responsive page reached by a
link, and a Teams tab covers the place an embed was wanted.

**Costs:** none a link does not solve.

## `azd up` only

Considered: a portal deploy button and a Marketplace listing, both of which
would reuse the same Bicep templates. One install path is one path to test and
one set of instructions to keep true.

**Costs:** an admin who will not open a terminal cannot install it.

## Contributors bring their own tenant

Considered and rejected: recording real Graph responses into the repository so
that the product would run with no Microsoft account at all.

A recording drifts from what Graph actually returns, and anyone changing a
Graph call would then be testing against a fiction. Deetz is software for
Microsoft 365 on Azure; the people who work on the Graph layer have tenants,
and a trial tenant is free.

**Costs:** a higher bar to contribute to the Graph layer than to the rest.

## Nothing is hosted

Vercel serves the landing page. Every running copy of the product is somebody
else's install, in their subscription.

**Costs:** there is no demo anyone can click.

## Limits live in the app

Per-person quotas, the daily spend ceiling and the rate limit are enforced in
Deetz and counted in Postgres. Considered: a gateway or an API management
layer in front of the model.

More than one container has to share one set of counters, and the database is
already there.

**Costs:** the counters are ours to get right.

## What an update may change

A release may change anything inside the container. Five things are the
contract with an existing install and only a major release touches them: the
Entra app registration, the configuration values, the shape of the
infrastructure, the database schema, and the URL. A major release says so in
its notes.

**Costs:** some improvements wait for a major release.

## Switching an app off is enforced in code

The admin's switches decide which functions the model is offered. The server
also checks the switch before it makes a Graph call, so an app that is off
cannot be reached even if something tried. Considered and rejected: revoking
the consent for that app's scope, which would prompt everyone again and make a
switch that is meant to be reversible in a moment into an administrative
event.

**Costs:** a person's stored token still carries the scope for an app that is
switched off. The boundary is Deetz's code, not Entra's.
