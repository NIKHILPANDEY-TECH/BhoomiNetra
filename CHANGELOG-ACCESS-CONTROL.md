# BhoomiNetra — National Admin Access & Security Dashboard

## Implementation plan delivered

1. **Role-based access control:** Reuse the existing `roles`, `permissions`, and `role_permissions` many-to-many schema rather than inventing a parallel authorization system.
2. **Feature permission matrix:** National Admin selects a role and changes its allowed operations. API routes validate permissions server-side.
3. **Safe administration:** Protect the National Admin role from permission removal, prevent self-disable, and prevent disabling the final active National Admin.
4. **Account lifecycle:** National Admin can enable/disable user accounts.
5. **Optional identity verification:** A user can submit a PDF/JPEG/PNG credential. Files are Fernet-encrypted before database storage; only authorized National Admin users with `SECURITY_VIEW` can list, download, verify, or reject submissions.
6. **Auditability:** Role changes, account status changes, identity submission, and review decisions are recorded through the existing audit service.
7. **Frontend integration:** Add an Access Control entry to the National Admin navigation and protect the route as National Admin-only.

## Changed files

- `backend/app/models/identity_verification.py` — encrypted identity evidence and review metadata.
- `backend/app/models/__init__.py` — model registration.
- `backend/app/database/database.py` — create identity table and synchronize permission catalogue; ensure National Admin retains all permissions.
- `backend/app/routes/admin.py` — access-control APIs, account status API, identity upload/review/download APIs.
- `backend/.env.example` — identity encryption key configuration.
- `backend/README.md` — deployment and privacy setup instructions.
- `Frontend/src/pages/AccessControl.jsx` — new admin dashboard.
- `Frontend/src/App.jsx` — admin navigation entry.
- `Frontend/src/main.jsx` — protected route registration.

## API endpoints

- `GET /api/admin/access-control`
- `PUT /api/admin/roles/{role_id}/permissions`
- `PATCH /api/admin/users/{user_id}/status`
- `POST /api/admin/identity/upload`
- `GET /api/admin/identity`
- `GET /api/admin/identity/{verification_id}/document`
- `PATCH /api/admin/identity/{verification_id}/review`

## Important security notes

- The National Admin permission set is intentionally immutable from this screen to prevent lockout.
- A role-permission change applies to every user assigned to that role. This is RBAC, not per-user feature overrides.
- Identity uploads are disabled until `IDENTITY_ENCRYPTION_KEY` is configured.
- Do not collect Aadhaar by default. Prefer official employee IDs or another minimally necessary credential.
- The document key must be stable and backed up securely. Losing it makes existing encrypted documents unreadable.
- Production should add a documented retention/deletion period, encrypted database backups, rate limiting, malware scanning, and formal identity-review policy before accepting real documents.

## Validation performed

- Python `compileall` passed for the backend application.
- Full backend pytest collection could not run in this environment because `geoalchemy2` is not installed (`ModuleNotFoundError` during import).
- Frontend production build could not run: the interrupted dependency installation left Vite unavailable/permission-denied. No successful frontend build is claimed.
- No live database or deployed Railway/Render/Supabase environment was available, so API/database integration and real upload encryption were not end-to-end tested.
