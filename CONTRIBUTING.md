# Contributing to DirrochaCMS

<p>
  <strong>English</strong> · <a href="./CONTRIBUTING.pt-BR.md">Português (Brasil)</a>
</p>

Thank you for considering a contribution to DirrochaCMS. This document defines a simple flow
that keeps the project organized and easy to review.

> Issues and pull requests may be written in English or Portuguese.

## Where to get help

For questions about installing or using DirrochaCMS, open a
[GitHub issue](https://github.com/marco0antonio0/DirrochaCMS/issues) using the bug report or
feature request template. That is the project's support channel, and answers stay searchable
for other users. Vulnerabilities follow the separate flow in [SECURITY.md](./SECURITY.md).

## How to contribute

1. Check whether a related issue already exists.
2. If it does not, open an issue describing the problem, improvement or proposal.
3. Fork the repository.
4. Create a branch with a clear name.
5. Implement the change in a small scope.
6. Run the local checks.
7. Open a pull request with a focused description.

## Local environment

```bash
git clone https://github.com/marco0antonio0/DirrochaCMS.git
cd DirrochaCMS
npm install
cp .env.example .env
npm run dev
```

Fill in `.env` with the Firebase credentials before testing any flow that persists data. See
the [Firebase Admin Credential](./README.md#firebase-admin-credential-service-account) section
of the README for how to obtain them.

## Branch naming

Use short, descriptive names:

```text
feature/criar-endpoint
fix/modal-delete
docs/readme
refactor/backend-auth
```

## Commits

Prefer direct messages:

```text
feat: adiciona ordenacao de campos
fix: corrige estilo da tela de endpoint
docs: melhora guia de instalacao
```

## Before opening a pull request

Run:

```bash
npx tsc --noEmit
npm run build
```

The same pair of commands runs in CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
To validate the interface and API flows, follow the checklist in
[`docs/manual-verification.md`](./docs/manual-verification.md).

Include in the pull request:

- What changed.
- Why it changed.
- How to test it.
- Screenshots or a short recording when the change affects the UI.
- Notes about migrations, environment variables or risks.

## Code standards

- Follow the project's existing structure.
- Keep frontend code in `/app`.
- Keep backend logic in `/backend`.
- For new backend modules, use:

```text
<module>.service.ts      # business rules and validation
<module>.repository.ts   # Firestore access through the Admin SDK
<module>.entity.ts       # constants, defaults and domain contracts
<module>.model.ts        # TypeScript types of the domain
```

- Every file in `/backend` starts with `import "server-only"`. Nothing under `/backend` may be
  imported by a client component — Firestore is accessed from the server only.
- HTTP routes live in `app/api/admin/**/route.ts` (Next.js Route Handlers) and are protected by
  the `withAuth` guard in `backend/common/serverAuth.ts`. There is no longer a `.controller.ts`
  or `.module.ts` layer.
- Avoid refactors outside the scope of the pull request.
- Prefer clear names in either Portuguese or English, without mixing the two in the same
  context.
- Update the README — both [`README.md`](./README.md) and
  [`README.pt-BR.md`](./README.pt-BR.md) — when public behavior changes.

## Reporting bugs

When opening a bug issue, provide:

- Steps to reproduce.
- Expected result.
- Actual result.
- The environment used: Node, npm, browser and operating system.
- Screenshots, logs or payloads when they help.

## Proposing features

Explain:

- The problem the feature solves.
- The expected flow.
- The impact on existing users.
- Possible alternatives.

## Security

Do not publish vulnerabilities in issues. Use the flow described in
[SECURITY.md](./SECURITY.md).

## Code of conduct

All participation in the project must follow
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
