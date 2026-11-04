# Authentication and authorization

## Scope

The authentication branch implements AUTH-01 through AUTH-21. Access and refresh credentials
are sent exclusively in host-only HttpOnly cookies. React stores public account details in
AuthContext; it never stores bearer credentials in localStorage.

## Browser request flow

1. Read `GET /api/auth/csrf` with credentials enabled.
2. Send the returned `result` in `X-XSRF-TOKEN` together with browser cookies for POST, PUT,
   PATCH, and DELETE requests.
3. Sign in using `POST /api/auth/login`. The response contains public account details only.
4. The shared frontend API client retries an expired access request once after
   `POST /api/auth/refresh`; concurrent refreshes in one tab share one promise.
5. Sign out using `POST /api/auth/logout`; the access identifier and refresh family are revoked.
6. Invalid or missing authentication returns JSON 401. Failed role, ownership, or CSRF checks return JSON 403.

Access tokens contain a numeric account ID, issuer, purpose, issuance/expiration dates,
unique identifier, and account credential version. Current roles and active state are
read from the database. Changing username does not change account identity.

Refresh tokens are opaque random credentials. Only SHA-256 digests are stored. Rotation
locks the refresh row, consumes it, and creates a successor with the original family's
absolute expiry. Replaying a consumed credential revokes that family and invalidates
the account's existing sessions. Multiple tabs may therefore need to sign in again if
they race a rotation. Password changes and resets invalidate all account sessions.
Disabling an account invalidates credentials permanently, including after it is unbanned.

## API reference

All paths below are relative to `/parttime_hiring_platform`. JSON responses use
`{ status, code, message, result, timestamp }`. No response includes an access or refresh token.

| Method | Path | Purpose | Access | Typical responses |
|---|---|---|---|---|
| GET | /api/auth/csrf | Obtain request protection token | Public | 200 |
| POST | /api/auth/register | Register candidate details | Public + CSRF | 200, 400, 409, 429 |
| POST | /api/auth/login | Authenticate and set session cookies | Public + CSRF | 200, 401, 429 |
| POST | /api/auth/refresh | Rotate browser credentials | Refresh cookie + CSRF | 200, 401 |
| POST | /api/auth/logout | Revoke this browser session | Public + CSRF | 200 |
| POST | /api/auth/forgot-password | Request an email reset link | Public + CSRF | 200, 400, 429 |
| POST | /api/auth/reset-password | Consume a reset link | Public + CSRF | 200, 400, 429 |
| POST | /api/auth/change-password | Reauthenticate and change password | Authenticated + CSRF | 200, 400, 401 |
| GET | /api/users/me | Read current public profile | Authenticated | 200, 401 |
| POST | /api/employers/verifications/email/send-otp | Issue applicant-bound email code | Authenticated + CSRF | 200, 400, 429 |
| POST | /api/employers/verifications/email/verify-otp | Confirm code before submitting documents | Authenticated + CSRF | 200, 400, 429 |
| GET | /oauth2/authorization/google | Begin Google sign-in | Public | Redirect to provider |

Registration example:

```json
{
  "username": "candidate_demo",
  "password": "ExamplePassword123",
  "displayName": "Candidate Demo",
  "email": "candidate@example.com",
  "dateOfBirth": "2000-01-01"
}
```

Login example:

```json
{ "username": "candidate_demo", "password": "ExamplePassword123" }
```

Other mutation payloads:

```json
{
  "forgotPassword": { "email": "candidate@example.com" },
  "resetPassword": { "token": "<single-use-reset-token>", "password": "UpdatedPassword123" },
  "changePassword": { "currentPassword": "ExamplePassword123", "password": "UpdatedPassword123" },
  "sendOtp": { "email": "business@example.com" },
  "confirmOtp": { "email": "business@example.com", "otpCode": "123456" }
}
```

The labels above identify separate requests; send only the corresponding inner object.
Refresh and logout require no JSON payload.

Successful login response example:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Operation successful",
  "result": {
    "username": "candidate_demo",
    "roles": ["USER"],
    "displayName": "Candidate Demo",
    "avatarUrl": null
  },
  "timestamp": "2026-11-04T00:00:00Z"
}
```

Forbidden response example:

```json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "Permission denied",
  "result": null,
  "timestamp": "2026-11-04T00:00:00Z"
}
```

## Authorization boundaries

- Public job search remains accessible without authentication.
- `/api/admin/**` requires ADMIN.
- `/api/employer/**` requires EMPLOYER. Mutations also require an ACTIVE employer profile.
- Candidate application endpoints require USER.
- Shared account and business verification endpoints require authentication.
- Employer queries and updates enforce resource ownership, including employee queries by store.
- Employer approval creates the missing business profile and adds EMPLOYER without removing USER.
  Existing access cookies pick up changed roles on the next backend request; reload account
  details in the browser to refresh navigation.

## Password and verification rules

- New passwords require at least 8 characters and at most 72 UTF-8 bytes for BCrypt.
- Usernames contain 3–50 letters, digits, or underscores.
- Reset requests return a generic result regardless of whether an address exists.
- Reset links expire after 15 minutes and are single-use. SMTP failures are logged without secrets.
- Google sign-in requires a verified email and an active local account. Existing provider links
  are reused; matching local email alone does not silently link a new Google identity.
- Email verification codes expire after 5 minutes, allow at most 5 incorrect attempts, and have
  a 60-second resend cooldown. Codes are hashed with a server secret and bound to account and email.
- Confirming a code grants submission permission; successful submission consumes the permission.
- Sensitive routes are limited by peer address, login attempts by account, and email sending
  by account/address. Throttling returns 429 with Retry-After.
- Throttling is bounded and process-local. For multiple application instances or persistence
  across restarts, replace the limiter with shared storage and configure trusted proxy handling.
- Expired access revocations, refresh sessions, and reset credentials are cleaned hourly.

## Configuration

Use profile `local` for local HTTP development. It enables development seeding and disables
Secure cookies for localhost. Other profiles use Secure cookies and do not seed default accounts.

Set DB_USERNAME, DB_PASSWORD, JWT_SIGNER_KEY, and integration credentials in the backend process.
Set FRONTEND_URL and CORS_ALLOWED_ORIGINS to the deployed HTTPS frontend origin.
JWT_SIGNER_KEY must contain at least 64 UTF-8 bytes. Rotating it invalidates existing access
tokens and outstanding email verification challenges.

Set VITE_API_BASE_URL when building the frontend. See
[`ParttimeHiringFrontend/.env.example`](../ParttimeHiringFrontend/.env.example).
Do not put backend secrets in VITE-prefixed variables.

New persistence includes `users.auth_version`, `users.row_version`,
`auth_refresh_sessions`, `auth_revoked_access_tokens`, `auth_password_resets`, and the
account-bound OTP fields. Local Hibernate update creates these changes on startup.
The reviewable one-time upgrade SQL is in
[`database/migrations/001_authentication.sql`](../database/migrations/001_authentication.sql).
Do not run that upgrade again after Hibernate has already applied the same columns.
Back up an existing database before applying schema changes.

## Verification commands

From ParttimeHiringBackend:

```powershell
.\mvnw.cmd test '-Dbackend.build.directory=target/isolated-tests'
```

The optional output override avoids conflicts with VS Code's incremental Java compiler.
All test profiles use isolated H2 databases, not development MySQL.

From ParttimeHiringFrontend:

```powershell
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

Node 22.14+ supports the test command. Google consent/callback and actual SMTP delivery
still require manual checks using real provider credentials; automated tests mock those
external boundaries.
