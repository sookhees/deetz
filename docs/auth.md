# Authentication and Graph access

How a person signs in, how Deetz reaches Microsoft Graph as that person, who
counts as an admin, and what the install creates.

[direction.md](direction.md) says how much of this exists today.
[decisions.md](decisions.md) says why Better Auth.

## What it has to do

- A person signs in with the Entra ID account they already have.
- Every Graph call is made as that person, so an answer cannot contain
  anything they could not have found themselves.
- No token reaches the browser or the model.
- The admin sets it up once.

## Approach

[Better Auth](https://www.better-auth.com) with its Microsoft provider, and
sessions and tokens in Postgres from the first commit.

Sign-in runs on the server, so the server is the confidential client talking
to Entra, and it asks for the Graph scopes in the first authorisation request.
The access token that comes back is therefore already a Graph token for that
person, and no second exchange is needed to reach Graph.

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
      // Exactly one of these two is set. See "Credential".
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      clientAssertion: certificateAssertion,
      scope: graphScopes(enabledApps),
    },
  },
})
```

The configuration is built inside a function rather than at module load. That
is what lets an app the admin switches on take effect at the next sign-in
without a restart, and what lets the build run with no environment set.

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

Answering who someone reports to needs `User.Read.All`, which reads the whole
directory, so it stays out of the first version.

The admin picks the apps first and consents to exactly the scopes those apps
need. Switching another app on later is one more consent click. Switching one
off does not revoke anything: the function leaves the list the model sees, and
the server refuses a call to that app.

Admin consent is granted once for the tenant, and again only when an app is
added. It is the only step in the install that is a human clicking a button on
a Microsoft page.

### Who is admin

The install defines one app role on the registration, `Deetz.Admin`, and
assigns it through Graph to the person who ran `azd up`, so nobody visits
Entra for it.

Deetz signs people in rather than being called as an API, so Entra puts the
role in the `roles` claim of the ID token. Better Auth stores that token, and
the admin pages read the claim from it.

To add or remove an admin, assign or revoke the role in Entra, to a person or
a group. Deetz keeps no admin list of its own.

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
  return accessToken ?? null
}
```

If the stored token has expired, Better Auth refreshes it before returning it.
Entra rotates refresh tokens, and the new one replaces the old. The helper
returns `null` when there is no session and when a refresh fails, and the app
shows the sign-in state for both.

The chat route calls this once per request and hands the token to the tools
through the tools context, so `execute()` can call Graph without the model
ever handling it. The browser holds only the session cookie.

### Credential

The admin chooses how Deetz proves it is Deetz to Entra.

- **A client secret.** Entra caps secrets at two years, so the install records
  the expiry and the admin page warns before it lapses.
- **A certificate.** The private key lives in Key Vault, the app registration
  holds the public half, and Deetz signs a client assertion with the key on
  every token request. Entra expects the certificate's thumbprint in the
  assertion's `x5t` header, which the assertion function sets.

`azd up` defaults to a secret, because it can generate one without the admin
doing anything, and switching to a certificate is a setting rather than a
reinstall. Exactly one of the two is configured; startup refuses to run with
both or neither.

## The session

The session is a cookie on Deetz's own origin, set by a redirect to Deetz's
sign-in route and back. Deetz is one responsive page opened in a browser,
including when the link that led there was shared on an intranet page, in
SharePoint or in a Teams message, so a first-party cookie is all it needs.

A Teams tab is a different case, because the page runs inside Teams and gets
its token from Teams rather than from a sign-in here. That is in
[direction.md](direction.md).

## What the install creates

One app registration in Entra. The install does this for the admin where it
can, and shows the consent page for the click it cannot do.

- Platform: Web. Redirect URI `https://{host}/api/auth/callback/microsoft`,
  and `http://localhost:3001/api/auth/callback/microsoft` for development.
- The credential, secret or certificate, as above.
- API permissions: the delegated scopes for the apps the admin chose.
- The `Deetz.Admin` app role, assigned to the installing admin.
- Admin consent, granted.

Creating the registration and assigning the role are writes to the directory,
so the install performs them with the credentials of the admin running
`azd up`, not with Deetz's own registration. Deetz itself never holds a write
permission.

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

Nothing past the chat panel can be tested without a real tenant. How the
development tenant is created and populated is in
[direction.md](direction.md).
