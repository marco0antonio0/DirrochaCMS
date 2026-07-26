# Changelog

All notable changes to DirrochaCMS are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses semantic versioning while preparing public releases.

## [Unreleased]

- No unreleased changes.

## [1.0.0] - 2026-07-25

### Added

- JOSS submission material under `paper/`, `docs/`, and `examples/`.
- Automated tests with Vitest for password policy, endpoint-password handling,
  item-field validation, and public endpoint password behavior.
- GitHub Actions CI for dependency installation, type checking, automated tests,
  and production build.

### Changed

- Documentation was reorganized into English and Brazilian Portuguese versions.
- Academic use-case documentation was expanded for UFPA research-group use,
  OsteoPlay Vet, and Charmosinha/MakeAPI.

### Security

- Endpoint-level password access is documented and tested to require the
  `x-endpoint-password` header, not URL query parameters.

## [0.1.0] - 2026-07-25

### Added

- Dynamic endpoint builder with configurable fields.
- Public HTTP API routes for configured endpoints.
- Administrative panel for listing, creating, editing, and deleting endpoint
  records.
- Firebase Firestore persistence through the Firebase Admin SDK.
- Server-side authentication with JWT sessions stored in HTTP-only cookies.
- ALTCHA-based self-hosted anti-bot verification for login and first-account
  setup.
- Role-aware user management for panel accounts, including password changes,
  account deactivation, and deletion.
- Per-endpoint public/password access mode, with endpoint passwords accepted
  only through request headers.
- Endpoint history and audit records for administrative actions.
- Manual verification guide for build, authentication, endpoint, item, public
  API, private endpoint, and user-management flows.

### Security

- Firebase client credentials are no longer required in browser-exposed
  `NEXT_PUBLIC_FIREBASE_*` variables.
- Firestore access is performed server-side through the Admin SDK.
- Endpoint passwords are hashed before storage.
- Public item responses omit administrative ownership metadata.

[Unreleased]: https://github.com/marco0antonio0/DirrochaCMS/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/marco0antonio0/DirrochaCMS/releases/tag/v1.0.0
[0.1.0]: https://github.com/marco0antonio0/DirrochaCMS/releases/tag/v0.1.0
