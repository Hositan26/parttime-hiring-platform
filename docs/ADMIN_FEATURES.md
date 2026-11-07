# Admin features

Administration requires ADMIN. JSON responses follow `ApiResponse.result`; authenticated writes use the shared HttpOnly-cookie, refresh and CSRF client.
Paths below are relative to `/parttime_hiring_platform`.

## Navigation

| Menu | Routes / tabs |
| --- | --- |
| Tổng quan | `/admin/dashboard` |
| Duyệt doanh nghiệp | `/admin/verifications` |
| Tài khoản | `/admin/users`, `/admin/employers` |
| Cửa hàng | `/admin/stores` |
| Kiểm duyệt tin tuyển dụng | `/admin/jobs` |
| Báo cáo và đánh giá | `/admin/reports`, `/admin/reviews` |
| Danh mục | `/admin/categories`, `/admin/shifts` |

Existing tab routes remain valid direct links. Administration lists use bounded backend pagination and cancel stale frontend requests.

## API changes

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/admin/dashboard/stats` | Applications counted from JobApplication; pendingVerifications, pendingStores, pendingReports |
| GET | `/api/admin/users` | `query`, optional `active`, `page`, `size` |
| PUT | `/api/admin/users/{id}/ban` | Rejects self-locking; revokes existing sessions |
| PUT | `/api/admin/users/{id}/unban` | Restores login without reviving old sessions |
| GET | `/api/admin/employers` | `query` company name, `page`, `size`; separate business status and account isActive |
| PUT | `/api/admin/employers/{id}/status` | ACTIVE/SUSPENDED only; pending verification requires document review |
| GET | `/api/admin/verifications` | `query` company/tax code, `status`, `page`, `size` |
| GET | `/api/admin/verifications/{id}` | Confidential documents and review details |
| POST | `/api/admin/verifications/{id}/approve` | Atomic manual approval and employer-role grant |
| POST | `/api/admin/verifications/{id}/reject` | Required nonblank `{ "reason": "..." }`; applicant can read the reason |
| GET | `/api/admin/stores` | `query`, optional `isActive`, optional `approved`, `page`, `size` |
| PUT | `/api/admin/stores/{id}/approval` | `{ "isApproved": true }`; does not change activity |
| PUT | `/api/admin/stores/{id}/status` | `{ "isActive": true }`; activation requires approval |
| DELETE | `/api/admin/stores/{id}` | Refuses stores with jobs/employment history |
| GET | `/api/admin/jobs` | `query` title, optional backend `status`, `page`, `size` |
| GET | `/api/admin/jobs/{id}` | Moderation detail regardless of public availability |
| PUT | `/api/admin/jobs/{id}/status` | PAUSED removes and blocks employer reopening; ACTIVE restores only eligible jobs |
| DELETE | `/api/admin/jobs/{id}` | Refuses applications, interactions, reports or saved-job references |
| GET | `/api/admin/job-reports` | `page`, optional OPEN/RESOLVED `status` |
| PUT | `/api/admin/job-reports/{id}/resolve` | Keeps original complaint content |
| GET | `/api/admin/reviews` | `query` store/reviewer, `page`, `size` |
| PUT | `/api/admin/reviews/{id}/visibility?visible=false` | Hides review; true restores it |
| GET | `/api/admin/categories` | `query` category name, `page`, `size` |
| POST/PUT/DELETE | `/api/admin/categories`, `/api/admin/categories/{id}` | Validates names/normalized Vietnamese slug conflicts; protects assigned categories |
| GET | `/api/admin/shifts` | `query` shift name, `page`, `size` |
| POST/PUT/DELETE | `/api/admin/shifts`, `/api/admin/shifts/{id}` | Validates distinct times, overnight shifts, duplicate names and assigned shifts |

List size defaults to 10 and is limited to 50. Reports retain the existing 20-entry page size.
Reviews use existing VISIBLE/HIDDEN states. Job states are ACTIVE, PAUSED, CLOSED and EXPIRED.

## Deployment and verification

Apply [migration 008](../database/migrations/008_admin_moderation.sql) once if Hibernate has not already created the column.
See [ADMIN_TASK_REPORT.md](ADMIN_TASK_REPORT.md) for business decisions, commit mapping, test commands and precise verification limits.
