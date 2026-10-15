import { Component, StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom"

import "./index.css"

import App from "./App.jsx"

import Login from "./pages/login.jsx"
import Signup from "./pages/signup.jsx"
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
import CitizenProjects from "./pages/citizen/CitizenProjects.jsx"
import CitizenProjectDetails from "./pages/citizen/CitizenProjectDetails.jsx"
import CitizenMap from "./pages/citizen/CitizenMap.jsx"
import CitizenReports from "./pages/citizen/CitizenReports.jsx"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "BhoomiNetra React error:",
      error
    )

    console.error(
      "Component stack:",
      errorInfo?.componentStack
    )
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  handleDashboard = () => {
    this.setState({
      hasError: false,
      error: null,
    })

    window.location.href = "/dashboard"
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-screen bg-page px-6 py-12">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-text">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              BhoomiNetra could not load this page correctly.
              Your project data is safe. Please try again.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-lg bg-saffron px-5 py-3 text-sm font-semibold text-white"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleDashboard}
                className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-text"
              >
                Dashboard
              </button>
            </div>

            {import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-muted">
                  Technical details
                </summary>

                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-page p-3 text-xs text-muted">
                  {this.state.error?.stack ||
                    this.state.error?.message ||
                    "Unknown error"}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    )
  }
}

function Protected({ children }) {
  const token = localStorage.getItem(
    "bhoomiAccessToken"
  )

  return token
    ? children
    : <Navigate to="/login" replace />
}

function AdminOnly({ children }) {
  const role = localStorage.getItem("bhoomiBackendRole")
  return role === "NATIONAL_ADMIN" ? children : <Navigate to="/dashboard" replace />
}

function StaffOnly({ children }) {
  const role = localStorage.getItem("bhoomiBackendRole")
  return role === "LOCAL_CITIZEN" ? <Navigate to="/dashboard" replace /> : children
}

function CitizenOnly({ children }) {
  const role = localStorage.getItem("bhoomiBackendRole")
  return role === "LOCAL_CITIZEN" ? children : <Navigate to="/dashboard" replace />
}

function RoleAwareProjects() {
  const role = localStorage.getItem("bhoomiBackendRole")
  const location = useLocation()
  return role === "LOCAL_CITIZEN"
    ? <Navigate to={`/citizen/projects${location.search}`} replace />
    : <Projects />
}

function RoleAwareProjectDetails() {
  const role = localStorage.getItem("bhoomiBackendRole")
  const { id } = useParams()
  return role === "LOCAL_CITIZEN"
    ? <Navigate to={`/citizen/projects/${encodeURIComponent(id)}`} replace />
    : <ProjectDetails />
}

function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-132px)] items-center justify-center bg-page px-6 py-12">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-text">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          The page you requested does not exist or may have moved.
        </p>

        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-saffron px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Dashboard
        </a>
      </div>
    </main>
  )
}

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <ErrorBoundary>
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
            element={
              <Protected>
                <App />
              </Protected>
            }
          >

            <Route
              index
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={null}
            />

            <Route path="projects" element={<RoleAwareProjects />} />
            <Route path="projects/:id" element={<RoleAwareProjectDetails />} />

            <Route path="citizen/projects" element={<CitizenOnly><CitizenProjects /></CitizenOnly>} />
            <Route path="citizen/projects/:id" element={<CitizenOnly><CitizenProjectDetails /></CitizenOnly>} />
            <Route path="citizen/map" element={<CitizenOnly><CitizenMap /></CitizenOnly>} />
            <Route path="citizen/reports" element={<CitizenOnly><CitizenReports /></CitizenOnly>} />

            <Route path="risk-analysis" element={<StaffOnly><RiskAnalysis /></StaffOnly>} />
            <Route path="stage-prediction" element={<StaffOnly><StagePrediction /></StaffOnly>} />
            <Route path="recommendations" element={<StaffOnly><Recommendations /></StaffOnly>} />
            <Route path="what-if" element={<StaffOnly><WhatIf /></StaffOnly>} />

            <Route
              path="high-risk"
              element={
                <AdminOnly>
                  <HighRisk />
                </AdminOnly>
              }
            />

            <Route
              path="gis"
              element={
                <AdminOnly>
                  <GIS />
                </AdminOnly>
              }
            />

            <Route
              path="analytics"
              element={
                <AdminOnly>
                  <Analytics />
                </AdminOnly>
              }
            />

            <Route
              path="reports"
              element={<StaffOnly><Reports /></StaffOnly>}
            />

            <Route
              path="audit-logs"
              element={
                <AdminOnly>
                  <AuditLogs />
                </AdminOnly>
              }
            />

            <Route
              path="settings"
              element={<StaffOnly><Settings /></StaffOnly>}
            />

            <Route
              path="help"
              element={<Help />}
            />

            <Route
              path="alerts"
              element={<StaffOnly><Alerts /></StaffOnly>}
            />

            <Route
              path="*"
              element={<NotFound />}
            />

          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
