# Local Citizen demo account

The demo user is provisioned by the existing demo-user seed script. It is not created automatically on every application start.

## Default demo credentials

- Username: `citizen.demo`
- Password: `CitizenDemo-2026!`
- Role: `LOCAL_CITIZEN`
- Assigned area: Mandsaur, Madhya Pradesh

Set `DEMO_PASSWORD_CITIZEN` before running the script if you want a different password. If you override it, use that same password when logging in.

## Run the one-time seed

After the latest backend commit has been deployed to Railway, open the Railway service Console. Run the script from the deployed backend root (the directory containing `app/` and `scripts/`):

```bash
python -u /app/scripts/create_demo_users.py
```

If your service uses a different root directory, use the corresponding absolute path. The command must run inside the backend service and against the same `DATABASE_URL` as the live API. Do not run it against a local database or a different Supabase project.

A successful run prints `Demo-user seed successful` and verifies that `LOCAL_CITIZEN` and active user `citizen.demo` exist in that database. If the console shows old script contents without `LOCAL_CITIZEN`, the latest GitHub commit has not been deployed to that Railway service yet: deploy the commit first, then rerun the command. Application startup creates tables through the existing `init_db()` process.

Do not use the shared demo credentials for a real citizen account. `DEMO_MODE=false` disables passwordless demo login, but does not disable username/password login. Before public production use, set a unique `DEMO_PASSWORD_CITIZEN` and update/remove the displayed demo credential, or deactivate the demo account entirely.

## Citizen access policy

Citizens can only read published (`APPROVED`, `ACTIVE`, `COMPLETED`) projects matching their assigned district. They cannot use the staff project, prediction, risk explanation, administrative report, or user-management APIs. Citizen reports are private to the submitting account in this version.

## Troubleshooting “Demo account unavailable”

The frontend calls `POST /api/auth/demo-login` with `{ "role": "local_citizen" }`. The backend maps that role to `citizen.demo`; the login fails if the user is absent/inactive in the API's connected database or if `DEMO_MODE=false` in production. After seeding, confirm `GET /api/auth/me` succeeds following demo login. The frontend clears any partial tokens if the demo-login/profile request fails.

For a database-side check in Supabase SQL Editor:

```sql
SELECT u.username, u.is_active, r.name AS role
FROM public.users AS u
LEFT JOIN public.roles AS r ON r.id = u.role_id
WHERE u.username = 'citizen.demo';
```

Expected: one row with `is_active = true` and `role = LOCAL_CITIZEN`.
