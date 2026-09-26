import {
  Bell,
  ChevronDown,
  Search,
  Settings,
  User
} from "lucide-react"
import { useRef, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import ImageCarousel from "./components/ImageCarousel"
import logo from "./assets/bhoomi-netra-logo.jpeg"

function App() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [morePosition, setMorePosition] = useState({
    top: 0,
    left: 0
  })

  const moreButtonRef = useRef(null)
  const location = useLocation()

  const role = localStorage.getItem("bhoomiRole")

  const isAdministrative = role === "administrative"
  const isProjectManager = role === "project-manager"

  const isActive = (path) => location.pathname === path

  const moreItems = isAdministrative
    ? [
        { label: "High Risk", path: "/high-risk" },
        { label: "Risk Analysis", path: "/risk-analysis" },
        { label: "Stage Prediction", path: "/stage-prediction" },
        { label: "Recommendations", path: "/recommendations" },
        { label: "What-If", path: "/what-if" },
        { label: "Analytics", path: "/analytics" },
        { label: "Reports", path: "/reports" },
        { label: "Audit Logs", path: "/audit-logs" }
      ]
    : [
        { label: "Risk Analysis", path: "/risk-analysis" },
        { label: "Stage Prediction", path: "/stage-prediction" },
        { label: "Recommendations", path: "/recommendations" },
        { label: "What-If", path: "/what-if" },
        { label: "Reports", path: "/reports" }
      ]

  const toggleMore = () => {
    if (!moreButtonRef.current) {
      return
    }

    const rect = moreButtonRef.current.getBoundingClientRect()

    setMorePosition({
      top: rect.bottom + 2,
      left: rect.left
    })

    setMoreOpen((current) => !current)
  }

  return (
    <div className="min-h-screen bg-white text-text">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex min-h-24 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <Link to="/dashboard" className="shrink-0">
            <img
              src={logo}
              alt="BhoomiNETRA"
              className="h-20 w-auto object-contain sm:h-[88px]"
            />
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="text"
                placeholder={
                  isProjectManager ? "Search my projects" : "Search project"
                }
                className="h-11 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-text outline-none focus:border-saffron"
              />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
            <Link
              to="/alerts"
              aria-label="Notifications"
              className="flex items-center gap-2 text-sm font-medium text-text hover:text-green"
            >
              <Bell size={18} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">Notifications</span>
            </Link>

            <Link
              to="/settings"
              aria-label="Settings"
              className="flex items-center gap-2 text-sm font-medium text-text hover:text-green"
            >
              <Settings size={18} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              type="button"
              aria-label="Profile"
              className="flex items-center gap-2 text-sm font-medium text-text hover:text-green"
            >
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                <User
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="text-muted"
                />
              </span>

              <span className="hidden sm:inline">
                {isAdministrative ? "Administrative" : "Project Manager"}
              </span>
            </button>
          </div>
        </div>

        <div className="border-t border-border md:hidden">
          <div className="px-4 py-3 sm:px-6">
            <div className="relative w-full">
              <Search
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="text"
                placeholder={
                  isProjectManager ? "Search my projects" : "Search project"
                }
                className="h-10 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-text outline-none focus:border-saffron"
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="relative z-40 border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 sm:gap-8 sm:px-6 lg:px-10">
          <Link
            to="/dashboard"
            className={`shrink-0 border-b-2 py-4 text-sm font-semibold ${
              isActive("/dashboard")
                ? "border-saffron text-saffron"
                : "border-transparent text-text hover:text-green"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/projects"
            className={`shrink-0 border-b-2 py-4 text-sm font-semibold ${
              isActive("/projects")
                ? "border-saffron text-saffron"
                : "border-transparent text-text hover:text-green"
            }`}
          >
            {isAdministrative ? "Projects" : "My Projects"}
          </Link>

          {isAdministrative && (
            <Link
              to="/gis"
              className={`shrink-0 border-b-2 py-4 text-sm font-semibold ${
                isActive("/gis")
                  ? "border-saffron text-saffron"
                  : "border-transparent text-text hover:text-green"
              }`}
            >
              GIS
            </Link>
          )}

          <div className="relative shrink-0">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={toggleMore}
              className="flex items-center gap-1 border-b-2 border-transparent py-4 text-sm font-medium text-text hover:text-green"
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              More

              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  moreOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <Link
            to="/help"
            className={`shrink-0 border-b-2 py-4 text-sm font-semibold ${
              isActive("/help")
                ? "border-saffron text-saffron"
                : "border-transparent text-text hover:text-green"
            }`}
          >
            Help
          </Link>
        </div>
      </nav>

      {moreOpen &&
        createPortal(
          <div
            className="fixed z-[9999] w-56 rounded-lg border border-border bg-white py-2 shadow-xl"
            style={{
              top: `${morePosition.top}px`,
              left: `${morePosition.left}px`
            }}
          >
            {moreItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMoreOpen(false)}
                className="block w-full px-4 py-2.5 text-left text-sm text-text hover:bg-page hover:text-green"
              >
                {item.label}
              </Link>
            ))}
          </div>,
          document.body
        )}

      {location.pathname === "/dashboard" ? (
        <main className="min-h-[calc(100vh-132px)] bg-page">
          <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <ImageCarousel />

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-text sm:text-4xl">
                Welcome to BhoomiNetra
              </h1>

              <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-muted">
                {isAdministrative
                  ? "Monitor land acquisition projects, risks, delays, and administrative performance across India."
                  : "Monitor your assigned projects, acquisition progress, risks, delays, and recommended actions."}
              </p>
            </div>

            {isAdministrative ? (
              <div className="grid gap-5 md:grid-cols-3">
                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    Total Projects
                  </p>

                  <div className="mt-4 h-8" />
                </div>

                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    High Risk Projects
                  </p>

                  <div className="mt-4 h-8" />
                </div>

                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    Total Budget
                  </p>

                  <div className="mt-4 h-8" />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    My Projects
                  </p>

                  <div className="mt-4 h-8" />
                </div>

                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    High Risk Projects
                  </p>

                  <div className="mt-4 h-8" />
                </div>

                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-lg font-bold text-text sm:text-xl">
                    Project Status
                  </p>

                  <div className="mt-4 h-8" />
                </div>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="min-h-[calc(100vh-132px)] bg-page">
          <Outlet />
        </main>
      )}

      <footer className="bg-green py-5 text-center text-sm text-white">
        © 2026 BhoomiNetra. All CODES reserved.
      </footer>
    </div>
  )
}

export default App