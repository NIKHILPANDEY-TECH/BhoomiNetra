import {
  Layers3,
  Map,
  MapPin,
  Maximize2,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

function GIS() {
  const [showFilters, setShowFilters] = useState(false)

  const role = localStorage.getItem("bhoomiRole")
  const isAdministrative = role === "administrative"

  if (!isAdministrative) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-132px)] max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
            <Map
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-text">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            GIS project monitoring is available only to administrative users.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21]"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron sm:text-sm">
            Administrative Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            GIS Map
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            View the geographic distribution of land acquisition projects and
            monitor project risk across India.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <MapPin size={17} strokeWidth={2} aria-hidden="true" />
          <span>India</span>
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            Mapped Projects
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects with available location data
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            High Risk Locations
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Geographic areas with high-risk projects
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            States Covered
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            States represented in project data
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            Risk Coverage
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects with available risk predictions
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              placeholder="Search project or location"
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
                showFilters
                  ? "border-saffron text-saffron"
                  : "border-border text-text hover:border-saffron hover:text-saffron"
              }`}
            >
              <SlidersHorizontal
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />

              Filters
            </button>

            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron"
            >
              <Layers3 size={17} strokeWidth={2} aria-hidden="true" />
              Layers
            </button>

            <button
              type="button"
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron sm:col-span-1"
            >
              <Maximize2 size={17} strokeWidth={2} aria-hidden="true" />
              Fullscreen
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-border bg-page p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-text">
                  Map Filters
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Refine the geographic project view.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-text"
              >
                <X size={17} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                defaultValue=""
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              >
                <option value="" disabled>
                  State
                </option>

                <option value="all">All States</option>
              </select>

              <select
                defaultValue=""
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              >
                <option value="" disabled>
                  Project Type
                </option>

                <option value="all">All Project Types</option>
              </select>

              <select
                defaultValue=""
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              >
                <option value="" disabled>
                  Risk Level
                </option>

                <option value="all">All Risk Levels</option>
              </select>

              <select
                defaultValue=""
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              >
                <option value="" disabled>
                  Project Status
                </option>

                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[500px] overflow-hidden bg-page sm:min-h-[600px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#D9E1E844_1px,transparent_1px),linear-gradient(to_bottom,#D9E1E844_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="absolute left-4 top-4 rounded-lg border border-border bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Map size={17} strokeWidth={2} className="text-saffron" />

                <span className="text-sm font-semibold text-text">
                  India Project Map
                </span>
              </div>
            </div>

            <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center border-b border-border text-lg font-medium text-text transition hover:bg-page hover:text-saffron"
                aria-label="Zoom in"
              >
                +
              </button>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-lg font-medium text-text transition hover:bg-page hover:text-saffron"
                aria-label="Zoom out"
              >
                −
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white shadow-sm">
                  <Map
                    size={24}
                    strokeWidth={2}
                    className="text-saffron"
                    aria-hidden="true"
                  />
                </div>

                <h2 className="mt-5 text-lg font-bold text-text">
                  GIS map data unavailable
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Interactive project locations and risk markers will appear
                  here when geographic project data and the map service are
                  connected.
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-lg border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Risk Legend
              </p>

              <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-3 w-3 shrink-0 rounded-full border border-white bg-[#2E7D32] shadow-sm" />
                  Low Risk
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-3 w-3 shrink-0 rounded-full border border-white bg-[#B7791F] shadow-sm" />
                  Medium Risk
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-3 w-3 shrink-0 rounded-full border border-white bg-[#C66A00] shadow-sm" />
                  High Risk
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-3 w-3 shrink-0 rounded-full border border-white bg-[#C0392B] shadow-sm" />
                  Critical Risk
                </div>
              </div>
            </div>
          </div>

          <aside className="border-t border-border bg-white lg:border-l lg:border-t-0">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-bold text-text">
                Project Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Select a mapped project to view location and risk information.
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-lg border border-dashed border-border bg-page px-4 py-10 text-center">
                <MapPin
                  size={22}
                  strokeWidth={2}
                  className="mx-auto text-muted"
                  aria-hidden="true"
                />

                <p className="mt-4 text-sm font-semibold text-text">
                  No project selected
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Project details will appear here after selecting a project
                  from the map.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-lg border border-border bg-page p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Project
                  </p>

                  <p className="mt-2 text-sm font-semibold text-text">—</p>
                </div>

                <div className="rounded-lg border border-border bg-page p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Location
                  </p>

                  <p className="mt-2 text-sm font-semibold text-text">—</p>
                </div>

                <div className="rounded-lg border border-border bg-page p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Risk
                  </p>

                  <p className="mt-2 text-sm font-semibold text-text">—</p>
                </div>

                <div className="rounded-lg border border-border bg-page p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Delay Probability
                  </p>

                  <p className="mt-2 text-sm font-semibold text-text">—</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default GIS