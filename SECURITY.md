# Security Policy

<p>
  <strong>English</strong> · <a href="./SECURITY.pt-BR.md">Português (Brasil)</a>
</p>

Thank you for helping keep DirrochaCMS secure.

## Supported versions

While the project is in an early stage, the supported version is the repository's main branch.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| older versions | Not guaranteed |

## Reporting vulnerabilities

Do not open a public issue containing exploitable details of a vulnerability.

Use the project's GitHub to contact the maintainers:

https://github.com/marco0antonio0/DirrochaCMS

Include:

- A description of the vulnerability.
- Steps to reproduce.
- Expected impact.
- The affected environment.
- Evidence, logs or minimal payloads.

## Good practices for production

- Never commit `.env`.
- Use a strong, long `SECRET_KEY`, unique per environment (`npm run generate:secret`).
- Deploy the Firestore rules in [`firestore.rules`](./firestore.rules) before exposing the
  project publicly. Without them, the database stays reachable by anyone who knows the project
  ID.
- Review permissions before exposing the CMS publicly.
- Keep dependencies up to date.
- Run `npm run build` before publishing.

## Scope

Relevant security problems include:

- Authentication bypass.
- Data leakage.
- Unauthorized writes to Firebase.
- Insufficient validation on public routes.
- Secret exposure.
- Unauthorized code execution.
