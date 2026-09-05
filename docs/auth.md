# Authentication and Graph access

How a person signs in to Deetz, how Deetz reaches Microsoft Graph as that
person, and what the admin has to create once. This is the plan for the first
version. It is written before the code, so where the code disagrees, the code
is right and this file needs updating.

## Goals

- A person signs in with the Entra ID account they already have.
- Every Graph call is made as that person, so every answer is trimmed to what
  they can already open. Deetz never has more access than the person asking.
- No token ever reaches the browser, the widget, or the model.
- The admin sets it up once: an app registration and one consent click.

## Approach

[Better Auth](https://www.better-auth.com) with its Microsoft provider, asking
for the Graph scopes at sign-in, with sessions and tokens in Postgres from the
first commit.

Because the sign-in runs on the server, the server is the confidential client
talking to Entra. It asks for the Graph scopes in the first authorisation
request, so the access token Entra returns is already a Graph token for that
person. There is no intermediate token to exchange, which is why the
on-behalf-of flow is not needed. See "Later" for when it comes back.

Better Auth over Auth.js, for four reasons that each remove a piece of work:

- It stores the provider's access and refresh tokens in the database and
  refreshes them itself. Asking for a Graph token is one call.
- Its Microsoft provider takes a client assertion, so a certificate works the
  same way a secret does.
- Its bearer plugin can carry a session as a header instead of a cookie, which
  is the way out of the third-party cookie problem if the widget ever has to
  live on a foreign domain.
- It is a stable release line with a database at its centre, which is where
  Deetz was going to end up anyway.

### Provider

```ts
// lib/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      tenantId: env.MICROSOFT_TENANT_ID,
      // One of the two, never both. See "Credential".
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      clientAssertion: certificateAssertion,
      scope: GRAPH_SCOPES,
    },
  },
})
```

Each install serves one organisation, so `tenantId` is that tenant's id. The
`common` and `organizations` values are not used.

Identity keys on the Entra object id, not the email address. Entra does not
always send an email claim for managed accounts, and an email can change.

### Scopes

Delegated, all read-only:

| Scope                  | For                                                  |
| ---------------------- | ---------------------------------------------------- |
| `openid profile email` | Sign-in and the person's name for the transcript     |
| `offline_access`       | A refresh token, so a session outlives one hour      |
| `User.Read`            | The person's own profile                             |
| `Sites.Read.All`       | SharePoint pages and lists through the Search API    |
| `Files.Read.All`       | Documents in SharePoint and OneDrive                 |
| `Mail.Read`            | Messages, when the admin has mail switched on        |

The scope set is fixed at consent time. The admin's source switches
(SharePoint, OneDrive, mail) control which tools the model is offered, not
which scopes are requested. A switched-off source is a tool the model cannot
see.

Admin consent is granted once for the tenant. It removes the per-person consent
prompt whatever the tenant's user-consent policy is, and it is the only step in
the install that is a human clicking a button on a Microsoft page.

### Tokens

Better Auth keeps the access token, refresh token and expiry on the person's
account row. A server helper wraps its accessor:

```ts
// lib/graph-token.ts
export async function getGraphToken(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) return null
  const { accessToken } = await auth.api.getAccessToken({
    body: { providerId: "microsoft", userId: session.user.id },
  })
  return accessToken
}
```

If the stored token has expired, Better Auth refreshes it before returning it.
Entra rotates refresh tokens, and the new one replaces the old. If a refresh
fails, the helper returns nothing and the widget shows the sign-in state.

The chat route calls this once per request and hands the token to the tools
through the tools context, so `execute()` can call Graph and the model has no
field it could put a token in. The browser only ever holds the session cookie.

### Credential

The admin chooses how Deetz proves it is Deetz to Entra:

- **A client secret.** Simplest. Entra caps secrets at two years, so the
  install records the expiry and the admin screen warns before it lapses.
- **A certificate.** Microsoft's recommendation for production. The private
  key lives in Key Vault, the app registration holds the public half, and
  Deetz signs a client assertion with the key on every token request. Entra
  expects the certificate's thumbprint in the assertion's header, which the
  assertion function sets.

The install offers both. `azd up` defaults to a secret because it can generate
one without the admin doing anything. Switching to a certificate is a setting,
not a reinstall. Exactly one of the two is configured; startup refuses to run
with both or neither.

## The widget

The session is a cookie on Deetz's origin. That decides where the widget can
live in the first version:

- **Works:** the widget on pages served from Deetz's own origin, or from a
  subdomain that shares the parent domain. Intranet pages are the target.
- **Does not work:** the widget embedded on an unrelated domain. That is a
  third-party context, and Safari and Chrome block the cookie.

Sign-in from the widget is a redirect to Deetz's own sign-in route and back.
A popup is an option later if the redirect proves disruptive on long pages.

## What the admin creates

One app registration in Entra. The install does this for them where it can,
and shows the consent page for the click it cannot do.

- Platform: Web. Redirect URI `https://{host}/api/auth/callback/microsoft`.
- The credential, secret or certificate, as above.
- API permissions: the delegated scopes above.
- Admin consent, granted.

Environment:

| Variable                        | What                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`                  | Postgres. Sessions, accounts and tokens live here          |
| `BETTER_AUTH_SECRET`            | Signs and encrypts what Better Auth hands out. Key Vault   |
| `BETTER_AUTH_URL`               | The app's public origin                                    |
| `MICROSOFT_CLIENT_ID`           | The app registration's client id                           |
| `MICROSOFT_TENANT_ID`           | The tenant's directory id                                  |
| `MICROSOFT_CLIENT_SECRET`       | When using a secret                                        |
| `MICROSOFT_CLIENT_CERTIFICATE`  | The PEM private key, when using a certificate. From Key Vault, never a file in the repo |

Every one of these is read inside a function, never at import, so the build
needs none of them and CI runs without secrets.

## Development tenant

Nothing past the widget can be tested without a real tenant, so one is being
set up for development. Creating the Entra tenant and attaching a Microsoft
365 licence are portal steps. Everything after that is scripted with the Azure
CLI and Graph, so the tenant can be rebuilt from scratch: two or three test
users, a team site with a handful of documents, a couple of messages in a
mailbox, the app registration with its permissions, and admin consent. The
script lives in the repo once it exists, so a contributor with a tenant of
their own can run it too.

## Order of work

1. Postgres locally, the Drizzle adapter, and Better Auth's generated schema.
   This is the first thing the database is used for.
2. `lib/auth.ts` with the Microsoft provider, the route handler under
   `app/api/auth/[...all]`, and a guard on the chat API.
3. A signed-out state in the widget shell with one button: sign in with
   Microsoft.
4. `getGraphToken()`, and a first call to `/me` to prove the token is real and
   carries the Graph scopes. Then the Search API.
5. The certificate path: the assertion function with the thumbprint header,
   verified against the dev tenant.
6. `.env.example` documenting the variables, both credential paths. Bicep
   creates the registration in the setup work later.

## Later

- **Teams.** A Teams tab gets a token from Teams, not from a sign-in on our
  server. That token is for Deetz, so reaching Graph means on-behalf-of. Same
  `getGraphToken()` interface, a second way of filling it.
- **Foreign domains.** A widget on a site that does not share Deetz's domain
  cannot use the cookie. Better Auth's bearer plugin carries the session as a
  header instead; the widget would sign in through a popup on Deetz's origin
  and hold the token in memory. Its own docs say to use it with care, so it
  waits until a customer needs it.
- **Sign-out everywhere.** Front-channel logout to Entra, so signing out of
  Deetz also ends the Microsoft session where the admin wants that.

## Open questions

- Whether the widget's session cookie should be scoped to the parent domain
  so intranet subdomains share it, or kept to Deetz's host. Depends on where
  the first customers put it.
- Two things to confirm in the first hour against the dev tenant: that the
  Graph scopes requested at sign-in come back in the stored access token, and
  that the assertion header carries the thumbprint the way Entra wants it.
