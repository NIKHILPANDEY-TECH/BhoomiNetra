# BhoomiNetra Frontend

React/Vite frontend for the BhoomiNetra land-acquisition delay intelligence system.

## Stack

React · Vite · Tailwind CSS · React Router · Axios · Recharts · React-Leaflet · Lucide React

## Run locally

```bash
cd Frontend
npm install
npm run dev
```

Vite normally starts at:

```text
http://localhost:5173
```

## Environment

Set the backend API base URL through the project's Vite environment configuration.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Use the deployed backend URL for production.

## Main areas

- Login and role-based access
- Dashboard
- Projects and project details
- Risk analysis and stage prediction
- High-risk projects
- Recommendations
- What-if simulation
- GIS
- Alerts
- Analytics and reports
- Audit logs
- Settings

The frontend consumes the existing backend API and does not contain independent ML decision logic.

## Build

```bash
npm run build
```

## Deployment

The frontend is intended for Vercel deployment. Configure the production API base URL in the Vercel environment before building.

## Development rule

Keep API communication in the existing API layer. Do not introduce mock prediction logic or change backend contracts without an explicit API change.
