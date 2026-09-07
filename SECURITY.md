# Security

## Reporting a vulnerability

Report it privately through GitHub's private vulnerability reporting, on the
Security tab of this repository. That opens an advisory only the maintainers
can see, and keeps the report tracked rather than sitting in an inbox.

Please do not open a public issue for a vulnerability.

Include what you found, how to reproduce it, and what an attacker could do
with it. You will get an acknowledgement within a week, and an assessment of
whether it is a vulnerability and what the fix looks like within two.

## Supported versions

Fixes land on `main` and in the next release. Deetz is installed into each
customer's own subscription, so an installation only gets a fix when its
administrator pulls a release and deploys it. Run the most recent release.

## Scope

In scope: the application code in this repository, the Bicep templates, and
any container image published from it.

Out of scope: Microsoft Graph, Microsoft Entra, Azure OpenAI and the rest of
Azure. Report those to Microsoft. Also out of scope is anything that requires
an attacker to already hold a valid sign-in for the tenant and only lets them
reach what Microsoft Graph would have given that person anyway, since every
call Deetz makes is made as the signed-in person and trimmed by Microsoft's
permissions.

A finding that lets one signed-in person reach another person's content is in
scope, and is the most serious class of bug this project can have.

## What an installation holds

Worth knowing when judging severity. A running Deetz holds Microsoft Graph
access and refresh tokens for everyone who has signed in, in its own Postgres,
inside the customer's tenant. It holds no copy of the organisation's documents,
mail or messages.
