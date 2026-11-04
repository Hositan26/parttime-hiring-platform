# User features

## Browser entry points

| Route | Purpose |
|---|---|
| `/jobs` | Search and filter public jobs, with pages of 12 records |
| `/jobs/:id` | Available job details, application form, private moderation report |
| `/saved-jobs` | Saved jobs, pagination, removal |
| `/applied-jobs` | Application status, pending contact edits, withdrawal, conversation links |
| `/profile` | Account information and JPEG/PNG avatar upload |
| `/candidate-profile` | Summary, skills, experience and private PDF CV |
| `/candidate-profile/applications/:applicationId` | Profile/CV shared with an actual application participant |
| `/employment-history` | Account-owned employment records and work reviews |
| `/notifications` | Application decision notifications and read state |
| `/applications/:applicationId/conversation` | Private messages and interview proposals/responses |
| `/job-reports` | Own complaints; administrators see the moderation queue |
| `/verify-business` | Email confirmation, document submission and latest decision |

Employer application rows link to candidate CVs and conversations. Administrators can
open `/job-reports` to review and resolve complaints.

## Business rules

- Public searches and job details exclude closed, expired, future-published jobs,
  inactive stores and inactive employers. The expiry instant itself is unavailable.
- Application creation repeats availability checks on the server. Candidate-level
  pessimistic locking serializes duplicate checks and insertion.
- Only the candidate can edit or withdraw a pending application. Withdrawn applications
  remain in history and cannot be accepted. Reapplying to the same job is currently
  prevented even after withdrawal.
- Accepted applications retain employment history; end-of-employment changes belong to
  personnel management. Decisions and candidate notifications share one transaction.
- Reviews require account-owned, employer-verified employment whose start date has
  arrived. There is one review per employment record. Content edits preserve moderation state.
- Saved jobs are account-owned. Saving is idempotent. A job saved before closing remains
  in the private saved list; its public detail endpoint can subsequently return 404.
- Candidate profiles are shared live through applications, rather than being historical
  CV snapshots. An employer cannot access a withdrawn application's CV.
- CVs are private database documents, limited to 5 MB. Upload checks PDF signature/end
  markers; it does not perform malware scanning or full PDF structural validation.
  Downloads require authentication, use attachment/no-store headers and prohibit MIME sniffing.
- Avatars and verification images must decode as JPEG/PNG, fit within 4096 pixels per
  dimension and remain under 5 MB. Avatar images use the configured Cloudinary service.
- Conversations are restricted to the actual candidate and the job's employer. New
  messages/interviews require a pending or accepted application. Only the invitation
  recipient can accept/decline; participants can cancel a future open/accepted interview.
- Interview dates use the backend's local time convention. Messages and notifications
  refresh on navigation or explicit refresh; no WebSocket delivery is implemented.
- Reports are private to their author and administrators. One unresolved complaint per
  author/job is allowed. Administrators can resolve reports without deleting their text.
- The business submission form uses the shared CSRF-aware client. The backend validates
  files before consuming confirmed email proof, and prevents concurrent pending submissions.

## API additions

All paths are relative to `/parttime_hiring_platform`. JSON uses `ApiResponse.result`.
Authenticated writes use cookies and `X-XSRF-TOKEN`, as described in `AUTHENTICATION.md`.

| Method | Path | Request / result |
|---|---|---|
| GET | `/api/jobs/page` | Existing search filters plus `page=0&size=12`, maximum size 50 |
| GET | `/api/users/applications/my-applications` | Own applications in a standard response envelope |
| PUT | `/api/users/applications/{id}` | `{ "contactPhone": "0901234567", "note": "Updated availability" }` |
| POST | `/api/users/applications/{id}/withdraw` | Withdraw an owned pending application |
| POST | `/api/users/me/avatar` | Multipart `file`, JPEG/PNG |
| GET | `/api/users/employments` | Own paginated history |
| GET/PUT/DELETE | `/api/users/employments/{id}/review` | PUT `{ "rating": 5, "comment": "Helpful team" }` |
| GET | `/api/users/saved-jobs` | Own paginated saved jobs |
| PUT/DELETE | `/api/users/saved-jobs/{jobId}` | Idempotent save / account-owned removal |
| GET/PUT | `/api/candidate-profiles/me` | PUT `{ "summary": "...", "skills": "...", "experience": "..." }` |
| POST/GET | `/api/candidate-profiles/me/resume` | Multipart `file` / authenticated PDF attachment |
| GET | `/api/candidate-profiles/applications/{id}` | Participant-authorized current candidate profile |
| GET | `/api/candidate-profiles/applications/{id}/resume` | Participant-authorized PDF attachment |
| GET | `/api/users/notifications` | Own paginated notifications |
| PUT | `/api/users/notifications/{id}/read` | Mark owned notification read |
| GET | `/api/recruitment/applications/{id}` | Participant-authorized conversation, 20 entries per page |
| POST | `/api/recruitment/applications/{id}/messages` | `{ "body": "Are weekend shifts available?" }` |
| POST | `/api/recruitment/applications/{id}/interviews` | `{ "body": "Meet at the store", "meetingAt": "2030-01-02T10:00:00" }` |
| PUT | `/api/recruitment/interviews/{id}?status=ACCEPTED` | Recipient decision; also DECLINED or participant CANCELLED |
| POST | `/api/recruitment/jobs/{id}/reports` | `{ "body": "Please verify the advertised address" }` |
| GET | `/api/recruitment/reports` | Own paginated complaints |
| GET | `/api/admin/job-reports` | Administrator moderation queue |
| PUT | `/api/admin/job-reports/{id}/resolve` | Administrator-only resolution |

## Database and deployment

The local profile's Hibernate `update` creates the new tables and expands the application
status enum. For deployments using schema validation, review and apply migrations
`002_user_applications.sql` and `003_user_features.sql` once. Do not rerun them after
Hibernate has already applied the same schema changes. Back up existing databases first.

New tables: `user_saved_jobs`, `candidate_profiles`, `user_notifications`,
`recruitment_interactions`. Candidate documents live in the database, so database backups
must include their binary data. Profile, notification and conversation queries are bounded.

Google, SMTP and Cloudinary configuration remain environment-driven. Never put backend
credentials in `VITE_` variables. External provider consent and actual email/storage
delivery need real-service checks beyond mocked unit tests.

## Verification

```powershell
# From ParttimeHiringBackend
.\mvnw.cmd test '-Dbackend.build.directory=target/user-tests'

# From ParttimeHiringFrontend
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

`UserJourneyIntegrationTest` covers favorites, profile sharing, application acceptance,
notifications, employment history, reviews, interview responses and reports against
isolated H2. A separate execution has also passed against a disposable MySQL 8 database.
