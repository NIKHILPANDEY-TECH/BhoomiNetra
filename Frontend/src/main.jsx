import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import Login from "./pages/login.jsx"
import Projects from "./pages/projects.jsx"
import ProjectDetails from "./pages/project-details.jsx"
import RiskAnalysis from "./pages/risk-analysis.jsx"
import StagePrediction from "./pages/stage-prediction.jsx"
import Recommendations from "./pages/recommendations.jsx"
import WhatIf from "./pages/what-if.jsx"
import GIS from "./pages/gis.jsx"
import Alerts from "./pages/alerts.jsx"
import Reports from "./pages/reports.jsx"
import Analytics from "./pages/analytics.jsx"
import AuditLogs from "./pages/audit-logs.jsx"
import Settings from "./pages/settings.jsx"
import Help from "./pages/help.jsx"
import HighRisk from "./pages/high-risk.jsx"
import Signup from "./pages/signup.jsx"

function Protected({ children }) {
  return localStorage.getItem("bhoomiAccessToken") ? children : <Navigate to="/login" replace />
}

function AdminOnly({ children }) {
  const role = localStorage.getItem("bhoomiBackendRole")
  return role === "NATIONAL_ADMIN" ? children : <Navigate to="/dashboard" replace />
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Protected><App /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={null} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="risk-analysis" element={<RiskAnalysis />} />
          <Route path="stage-prediction" element={<StagePrediction />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="what-if" element={<WhatIf />} />
          <Route path="high-risk" element={<AdminOnly><HighRisk /></AdminOnly>} />
          <Route path="gis" element={<AdminOnly><GIS /></AdminOnly>} />
          <Route path="analytics" element={<AdminOnly><Analytics /></AdminOnly>} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AdminOnly><AuditLogs /></AdminOnly>} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
