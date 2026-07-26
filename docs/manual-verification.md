# Manual Verification

This document provides a verification checklist for DirrochaCMS. It covers both
local build verification and a functional smoke test against a real
Firebase/Firestore project.

## 1. Local Build Verification

Prerequisites:

- Node.js 20 or newer.
- npm.

Install dependencies:

```bash
npm ci
```

Create a local environment file:

```bash
cp .env.example .env
```

Generate a `SECRET_KEY`:

```bash
npm run generate:secret
```

Add the generated value to `.env`.

Configure `FIREBASE_SERVICE_ACCOUNT_B64` from a Firebase Admin service account,
following the instructions in `README.md`.

Run type checking:

```bash
npx tsc --noEmit
```

Run automated tests:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Expected result:

- `npx tsc --noEmit` exits with code `0`.
- `npm test` exits with code `0`.
- `npm run build` exits with code `0`.
- No Firebase credentials are exposed to the browser bundle.

## 2. Functional Smoke Test

Start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Initial Setup

1. Confirm that the first screen asks for initial administrator setup when no
   admin account exists.
2. Complete the ALTCHA challenge.
3. Create the first admin account.
4. Confirm that the app redirects to `/home`.

Expected result:

- An admin account is created in Firestore.
- A session cookie is set as `HttpOnly`.
- The admin area is accessible after setup.

### Authentication

1. Log out from the panel.
2. Return to `/`.
3. Complete the ALTCHA challenge.
4. Log in with the admin credentials.

Expected result:

- Login succeeds with valid credentials.
- Login fails with invalid credentials.
- Administrative API routes are not accessible without a valid session.

### Endpoint Creation

1. Open `/configuration`.
2. Create an endpoint named `posts`.
3. Add at least these fields:
   - `titulo`, type `Texto`.
   - `descricao`, type `Texto`, multi-line enabled.
   - `data`, type `Data`.
4. Save the endpoint.
5. Open `/home`.
6. Confirm that `posts` appears in the endpoint list.

Expected result:

- The endpoint is stored in Firestore.
- The endpoint appears in the panel without reloading credentials in the
  browser.

### Item Management

1. Open `/home/posts`.
2. Create a new record with sample values.
3. Edit the record.
4. Delete the record and confirm the deletion modal.

Expected result:

- Create, edit, and delete operations succeed.
- The record list updates after each operation.
- The public API never returns admin-only metadata such as password hashes.

### Public API Access

Create a record in `posts`, then run:

```bash
curl http://localhost:3000/api/posts
```

Expected result:

- The response returns status `200`.
- The response includes the public records for `posts`.

If the endpoint has a `titulo_identificador`, test lookup by identifier:

```bash
curl "http://localhost:3000/api/posts?t=sample-title"
```

Expected result:

- The response returns the matching public record or an empty public result.

### Private Endpoint Password

1. Open the settings modal for the `posts` endpoint.
2. Change API access from public to private.
3. Set a manual password or use the randomize button.
4. Save the endpoint.

Without the password:

```bash
curl -i http://localhost:3000/api/posts
```

Expected result:

- The response is rejected.

With password in the required header:

```bash
curl -i http://localhost:3000/api/posts \
  -H "x-endpoint-password: YOUR_PASSWORD"
```

Expected result:

- The response succeeds.

### User Management

1. Open `/configuration`.
2. Create a second panel account.
3. Change that account password.
4. Disable the account.
5. Confirm the disabled account cannot log in.
6. Re-enable or delete the account.

Expected result:

- Admin users can create, update passwords, disable, and delete other panel
  accounts.
- Disabling or deleting a user revokes active sessions for that account.

## 3. Cleanup

After verification:

1. Delete test records and endpoints from the panel.
2. Remove temporary users.
3. Rotate or delete any Firebase service account used only for testing.
