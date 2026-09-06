# Authentication and Graph access

How a person signs in to Deetz, how Deetz reaches Microsoft Graph as that
person, who counts as the admin, and what the install creates once. This is
the plan for the first version. It is written before the code, so where the
code disagrees, the code is right and this file needs updating.

## Goals

- A person signs in with the Entra ID account they already have, and asks.
  There is nothing for them to set up.
- Every Graph call is made as that person, so every answer is trimmed to what
  they can already open. Deetz never has more access than the person asking.
- No token ever reaches the browser or the model.
- The admin sets it up once: pick the apps, one consent click.

## Approach

[Better Auth](https://www.better-auth.com) with its Microsoft provider, asking
for the Graph scopes at sign-in, with sessions and tokens in Postgres from the
first commit.

Because the sign-in runs on the server, the server is the confidential client
talking to Entra. It asks for the Graph scopes in the first authorisation
request, so the access token Entra returns is already a Graph token for that
person. There is no intermediate token to exchange, which is why the
on-behalf-of flow is not needed. See "Later" for when it comes back.

Better Auth over Auth.js, for three reasons that each remove a piece of work:

- It stores the provider's access and refresh tokens in the database and
  refreshes them itself. Asking for a Graph token is one call.
- Its Microsoft provider takes a client assertion, so a certificate works the
  same way a secret does.
- It is a stable release line with a database at its centre, which is where
  Deetz was going to end up anyway.

### Provider

```ts
// apps/deetz/features/auth/lib/auth.ts
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
      scope: graphScopes(enabledApps),
    },
  },
})
```

Each install serves one organisation, so `tenantId` is that tenant's id. The
`common` and `organizations` values are not used.

Identity keys on the Entra object id, not the email address. Entra does not
always send an email claim for managed accounts, and an email can change.

### Scopes

Delegated, all read-only, one set per app:

| App        | Scope                                   | For                                                          |
| ---------- | --------------------------------------- | ------------------------------------------------------------ |
| SharePoint | `Sites.Read.All`, `Files.Read.All`      | Sites, pages and lists through the Search API, and reading their documents |
| OneDrive   | `Files.Read.All`                        | The person's own files                                       |
| Mail       | `Mail.Read`                             | Messages, and search across the mailbox                      |
| Calendar   | `Calendars.Read`                        | The calendar view                                            |
| Teams      | `Chat.Read`, `ChannelMessage.Read.All`  | Chats and channel messages the person is in                  |
| People     | `People.Read`, `User.ReadBasic.All`     | Who someone is: name, title, department                      |

Always, for sign-in itself: `openid profile email offline_access User.Read`.
That is the person's identity and name, a refresh token so a session outlives
one hour, and their own profile.

Answering who someone reports to needs `User.Read.All`, which reads the whole
directory, so it stays out of the first version.

The admin picks the apps first and consents to exactly the scopes those apps
need. Switching another app on later is one more consent click. Switching one
off needs nothing: its function leaves the list the model sees.

Admin consent is granted once for the tenant, and again only when an app is
added. It removes the per-person consent prompt whatever the tenant's
user-consent policy is, and it is the only step in the install that is a
human clicking a button on a Microsoft page.

### Who is admin

The install defines one app role on the registration, `Deetz.Admin`, and
assigns it through Graph to the person who ran `azd up`, so nobody visits
Entra for it. Entra puts the role in the token's `roles` claim; Deetz checks
the claim on the admin pages and nowhere else. To add or remove an admin,
assign or revoke the role in Entra, to a person or a group. Deetz keeps no
admin list of its own.

### Tokens

Better Auth keeps the access token, refresh token and expiry on the person's
account row. A server helper wraps its accessor:

```ts
// apps/deetz/features/auth/lib/graph-token.ts
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
fails, the helper returns nothing and the app shows the sign-in state.

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

## The session

The session is a cookie on Deetz's origin. The app is one responsive page,
opened in a browser on a laptop or a phone, or from a link on the intranet, in
SharePoint or in Teams, so a first-party cookie is all it needs. Sign-in is a
redirect to Deetz's own sign-in route and back.

## What the install creates

One app registration in Entra. The install does this for the admin where it
can, and shows the consent page for the click it cannot do.

- Platform: Web. Redirect URI `https://{host}/api/auth/callback/microsoft`.
- The credential, secret or certificate, as above.
- API permissions: the delegated scopes for the apps the admin chose.
- The `Deetz.Admin` app role, assigned to the installing admin.
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

Nothing past the chat panel can be tested without a real tenant. How the
development tenant is created and populated is in
[design.md](design.md#next), so it lives in one place.

## Order of work

1. Postgres locally, the Drizzle adapter, and Better Auth's generated schema.
   This is the first thing the database is used for.
2. `features/auth` in `apps/deetz`: the Microsoft provider, the route handler
   under `app/api/auth/[...all]`, and a guard on the chat API.
3. A signed-out state in the app with one button: sign in with Microsoft.
4. `getGraphToken()`, and a first call to `/me` to prove the token is real and
   carries the Graph scopes. Then the Search API.
5. The `Deetz.Admin` role: defined on the dev tenant's registration, read from
   the claim, checked on the admin page.
6. The certificate path: the assertion function with the thumbprint header,
   verified against the dev tenant.
7. `.env.example` documenting the variables, both credential paths. Bicep
   creates the registration and the role in the setup work later.

## Later

- **Teams.** A Teams tab gets a token from Teams, not from a sign-in on our
  server. That token is for Deetz, so reaching Graph means on-behalf-of. Same
  `getGraphToken()` interface, a second way of filling it.
- **Sign-out everywhere.** Front-channel logout to Entra, so signing out of
  Deetz also ends the Microsoft session where the admin wants that.

## Open questions

- Two things to confirm in the first hour against the dev tenant: that the
  Graph scopes requested at sign-in come back in the stored access token, and
  that the assertion header carries the thumbprint the way Entra wants it.
- Whether the scope for an app the admin later switches off should be revoked
  or left consented and unused. Leaving it is simpler; revoking is tidier for
  an audit.
