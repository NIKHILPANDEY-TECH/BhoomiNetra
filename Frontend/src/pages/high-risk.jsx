import {
  AlertTriangle,
  ArrowUpRight,
  Filter,
  MapPin,
  Search,
  ShieldAlert
} from "lucide-react"
import { Link } from "react-router-dom"

function HighRisk() {
  const role = localStorage.getItem("bhoomiRole")
  const isAdministrative = role === "administrative"

  if (!isAdministrative) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-132px)] max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
            <ShieldAlert
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
            High-risk project monitoring is available only to administrative
            users.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21]"
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
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            High Risk Projects
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Monitor projects with elevated risk or predicted delay probability
            that may require administrative attention.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <ShieldAlert
            size={18}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <span>Priority Monitoring</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              High Risk Projects
            </p>

            <AlertTriangle
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects requiring closer monitoring
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Critical Risk Projects
            </p>

            <ShieldAlert
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects with critical risk classification
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Delay Probability
            </p>

            <ArrowUpRight
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Highest predicted delay probability
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              placeholder="Search high-risk project"
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              Risk Level
            </option>

            <option value="all">All Risk Levels</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              State
            </option>

            <option value="all">All States</option>
          </select>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron"
          >
            <Filter size={17} strokeWidth={2} aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text">
              Priority Risk Projects
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Projects identified for priority monitoring.
            </p>
          </div>

          <span className="shrink-0 text-sm font-medium text-muted">
            — Projects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="border-b border-border bg-page">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Project
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Location
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Risk Level
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Delay Probability
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Primary Risk
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
                      <ShieldAlert
                        size={20}
                        strokeWidth={2}
                        className="text-muted"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-text">
                      No high-risk project data available
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      High-risk projects will appear here when prediction data
                      is available.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <MapPin
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Risk Monitoring Scope
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Geographic and administrative coverage of high-risk projects.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
          <p className="text-sm font-semibold text-text">
            Risk distribution unavailable
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            State and district-level risk distribution will appear here when
            project and prediction data are connected.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HighRisk