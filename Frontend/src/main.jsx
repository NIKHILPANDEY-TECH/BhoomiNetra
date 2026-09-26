import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import Alerts from "./pages/alerts.jsx"
import Analytics from "./pages/analytics.jsx"
import AuditLogs from "./pages/audit-logs.jsx"
import GIS from "./pages/gis.jsx"
import Help from "./pages/help.jsx"
import HighRisk from "./pages/high-risk.jsx"
import Login from "./pages/login.jsx"
import Projects from "./pages/projects.jsx"
import ProjectDetails from "./pages/project-details.jsx"
import Recommendations from "./pages/recommendations.jsx"
import Reports from "./pages/reports.jsx"
import RiskAnalysis from "./pages/risk-analysis.jsx"
import Settings from "./pages/settings.jsx"
import Signup from "./pages/signup.jsx"
import StagePrediction from "./pages/stage-prediction.jsx"
import WhatIf from "./pages/what-if.jsx"

function ProtectedRoute({ children }) {
  const role = localStorage.getItem("bhoomiRole")

  if (!role) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RoleRoute({ roles, children }) {
  const role = localStorage.getItem("bhoomiRole")

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppShell() {
  return (
    <ProtectedRoute>
      <App />
    </ProtectedRoute>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/"
          element={<AppShell />}
        >
          <Route
            index
            element={<Navigate to="/login" replace />}
          />

          <Route path="dashboard" />

          <Route
            path="projects"
            element={<Projects />}
          />

          <Route
            path="projects/:id"
            element={<ProjectDetails />}
          />

          <Route
            path="risk-analysis"
            element={<RiskAnalysis />}
          />

          <Route
            path="stage-prediction"
            element={<StagePrediction />}
          />

          <Route
            path="recommendations"
            element={<Recommendations />}
          />

          <Route
            path="what-if"
            element={<WhatIf />}
          />

          <Route
            path="high-risk"
            element={
              <RoleRoute roles={["administrative"]}>
                <HighRisk />
              </RoleRoute>
            }
          />

          <Route
            path="gis"
            element={
              <RoleRoute roles={["administrative"]}>
                <GIS />
              </RoleRoute>
            }
          />

          <Route
            path="analytics"
            element={
              <RoleRoute roles={["administrative"]}>
                <Analytics />
              </RoleRoute>
            }
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="audit-logs"
            element={
              <RoleRoute roles={["administrative"]}>
                <AuditLogs />
              </RoleRoute>
            }
          />

          <Route
            path="settings"
            element={<Settings />}
          />

          <Route
            path="help"
            element={<Help />}
          />

          <Route
            path="alerts"
            element={<Alerts />}
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)