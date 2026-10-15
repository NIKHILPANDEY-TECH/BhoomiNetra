# Local Citizen demo account

The demo user is provisioned by the existing demo-user seed script. It is not created automatically on every application start.

## Default demo credentials

- Username: `citizen.demo`
- Password: `CitizenDemo-2026!`
- Role: `LOCAL_CITIZEN`
- Assigned area: Mandsaur, Madhya Pradesh

Set `DEMO_PASSWORD_CITIZEN` before running the script if you want a different password. If you override it, use that same password when logging in.

## Run the one-time seed

From the `backend` directory, point `DATABASE_URL` at the same PostgreSQL database used by the Railway deployment, then run:

```bash
python scripts/create_demo_users.py
```

The script creates/updates the `LOCAL_CITIZEN` role and its limited permissions, creates the Mandsaur jurisdiction if needed, and creates/updates `citizen.demo`. Application startup creates the new `citizen_reports` table through the project's existing `init_db()` process.

Do not use the shared demo credentials for a real citizen account. `DEMO_MODE=false` disables passwordless demo login, but does not disable username/password login. Before public production use, set a unique `DEMO_PASSWORD_CITIZEN` and update/remove the displayed demo credential, or deactivate the demo account entirely.

## Citizen access policy

Citizens can only read published (`APPROVED`, `ACTIVE`, `COMPLETED`) projects matching their assigned district. They cannot use the staff project, prediction, risk explanation, administrative report, or user-management APIs. Citizen reports are private to the submitting account in this version.
