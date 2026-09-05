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

Auth.js (`next-auth` v5) with its Microsoft Entra ID provider, asking for the
Graph scopes at sign-in.

Because the sign-in runs on the server, the server is the confidential client
talking to Entra. It asks for the Graph scopes in the first authorisation
request, so the access token Entra returns is already a Graph token for that
person. There is no intermediate token to exchange, which is why the
on-behalf-of flow is not needed. See "Later" for when it comes back.

### Provider

```ts
// auth.ts
import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: { scope: GRAPH_SCOPES.join(" ") },
      },
    }),
  ],
  callbacks: { jwt, session },
})
```

Each install serves one organisation, so the issuer is tenant-specific:
`https://login.microsoftonline.com/{tenantId}/v2.0`. The `organizations` and
`common` issuers are not used.

### Scopes

Delegated, all read-only:

| Scope            | For                                                  |
| ---------------- | ---------------------------------------------------- |
| `openid profile email` | Sign-in and the person's name for the transcript |
| `offline_access` | A refresh token, so a session outlives one hour      |
| `User.Read`      | The person's own profile                              |
| `Sites.Read.All` | SharePoint pages and lists through the Search API    |
| `Files.Read.All` | Documents in SharePoint and OneDrive                 |
| `Mail.Read`      | Messages, when the admin has mail switched on        |

The scope set is fixed at consent time. The admin's source switches
(SharePoint, OneDrive, mail) control which tools the model is offered, not
which scopes are requested. A switched-off source is a tool the model cannot
see.

Admin consent is granted once for the tenant. It removes the per-person consent
prompt whatever the tenant's user-consent policy is, and it is the only step in
the install that is a human clicking a button on a Microsoft page.

### Tokens

The `jwt` callback keeps three things from the sign-in: the access token, the
refresh token, and the expiry. On every later request it checks the expiry
and, if the token has lapsed, posts the refresh token to the tenant's token
endpoint and stores what comes back. Entra rotates refresh tokens, so the new
one replaces the old. If the refresh fails, the session carries an error and
the next request sends the person back to sign in.

The `session` callback exposes name, email and the error flag to the client,
and nothing else. Tokens stay server-side.

Session strategy is the JWT cookie for the first version. Graph tokens are
large, so Auth.js splits the cookie into chunks; that is normal. When Postgres
lands, sessions move to the database and tokens never leave the server's own
store.

A server helper, `getGraphToken()`, reads the token from the session and hands
it to the chat tools through the tools context, so `execute()` can call Graph
and the model has no field it could put a token in.

## The widget

Auth.js is cookie-based and the cookie belongs to Deetz's origin. That decides
where the widget can live in the first version:

- **Works:** the widget on pages served from Deetz's own origin, or from a
  subdomain that shares the parent domain. Intranet pages are the target.
- **Does not work:** the widget embedded on an unrelated domain. That is a
  third-party context, and Safari and Chrome block the cookie.

Sign-in from the widget is a redirect to Deetz's own sign-in route and back.
A popup is an option later if the redirect proves disruptive on long pages.

## What the admin creates

One app registration in Entra. The install does this for them where it can,
and shows the consent page for the click it cannot do.

- Platform: Web. Redirect URI
  `https://{host}/api/auth/callback/microsoft-entra-id`.
- A client secret. Entra caps secrets at two years, so the install records the
  expiry and the admin screen warns before it lapses. A certificate is the
  better long-term answer and is an open question below.
- API permissions: the delegated scopes above.
- Admin consent, granted.

Environment:

| Variable                          | What                                              |
| --------------------------------- | ------------------------------------------------- |
| `AUTH_SECRET`                     | Encrypts the session cookie. Key Vault in Azure. |
| `AUTH_MICROSOFT_ENTRA_ID_ID`      | The app registration's client id                  |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET`  | Its client secret                                 |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER`  | `https://login.microsoftonline.com/{tenantId}/v2.0` |
| `AUTH_TRUST_HOST`                 | `true` behind Container Apps' proxy               |

Every one of these is read inside a function, never at import, so the build
needs none of them and CI runs without secrets.

## Order of work

1. Install `next-auth`, add `auth.ts`, the route handler under
   `app/api/auth/[...nextauth]`, and middleware that protects the chat API.
2. A signed-out state in the widget shell with one button: sign in with
   Microsoft.
3. The refresh logic in the `jwt` callback, tested against a stubbed token
   endpoint so it runs in CI.
4. `getGraphToken()`, and a first call to `/me` to prove the token is real.
   Then the Search API.
5. `.env.example` documenting the variables. Bicep creates the registration in
   the setup work later.
6. Sessions to Postgres when the database lands.

## Later

- **Teams.** A Teams tab gets a token from Teams, not from a sign-in on our
  server. That token is for Deetz, so reaching Graph means on-behalf-of. Same
  `getGraphToken()` interface, a second way of filling it.
- **Foreign domains.** A widget on a site that does not share Deetz's domain
  needs a token handed to the browser instead of a cookie. That is MSAL in
  the browser plus on-behalf-of on the server. Only if a customer needs it.
- **Sign-out everywhere.** Front-channel logout to Entra, so signing out of
  Deetz also ends the Microsoft session where the admin wants that.

## Open questions

- A Microsoft 365 tenant to develop against, with some SharePoint content and
  two or three test users. Nothing past the widget can be tested without one.
- Client secret or certificate for the app registration. Secrets are simpler
  to create from Bicep; certificates do not expire on the admin.
- Whether the widget's session cookie should be scoped to the parent domain
  so intranet subdomains share it, or kept to Deetz's host. Depends on where
  the first customers put it.
