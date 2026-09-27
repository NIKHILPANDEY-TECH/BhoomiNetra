# BhoomiNetra Frontend - Connected Deployment

This frontend keeps the existing BhoomiNetra page structure and connects it to the deployed FastAPI backend.

## Backend

Production API:
https://bhoominetra-backend.onrender.com

The frontend defaults to this URL, but Vercel can override it with:

VITE_API_BASE_URL=https://bhoominetra-backend.onrender.com

## Vercel

Set the project Root Directory to:

Frontend

Build Command:

npm run build

Output Directory:

dist

Environment Variable:

VITE_API_BASE_URL=https://bhoominetra-backend.onrender.com

Redeploy after saving the environment variable.

`vercel.json` is included so React Router deep links work on refresh.

## Connected features

- Real FastAPI authentication and demo-login
- JWT access/refresh token handling
- Dashboard summary and risk distribution
- Project listing/search/create/detail
- ML prediction execution
- Risk analysis + SHAP factors
- Bottleneck analysis
- Stage view
- Recommendations
- What-if simulation
- Alerts and mark-as-read
- Reports
- Administrative analytics
- Audit logs
- PostGIS-backed GIS project coordinates

## Important

The backend CORS configuration must include the deployed frontend origin:

https://bhoomi-netra-three.vercel.app

Do not put a trailing slash in the CORS origin.
