import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Filter,
  MapPin,
  TrendingUp
} from "lucide-react"
import { Link } from "react-router-dom"

function Analytics() {
  const role = localStorage.getItem("bhoomiRole")
  const isAdministrative = role === "administrative"

  if (!isAdministrative) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-132px)] max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
            <BarChart3
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
            Administrative analytics are available only to administrative
            users.
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
            Analytics
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Analyze project performance, delay trends, risk distribution, and
            administrative indicators across India.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <BarChart3 size={18} strokeWidth={2} aria-hidden="true" />
          <span>Administrative Analytics</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Filter
            size={18}
            strokeWidth={2}
            className="text-saffron"
            aria-hidden="true"
          />

          <h2 className="text-sm font-semibold text-text">
            Analytics Filters
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <MapPin
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-9 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                State
              </option>

              <option value="all">All States</option>
            </select>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <MapPin
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-9 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                District
              </option>

              <option value="all">All Districts</option>
            </select>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <BarChart3
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-9 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                Project Type
              </option>

              <option value="all">All Project Types</option>
            </select>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-9 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                Time Period
              </option>

              <option value="all">All Time</option>
            </select>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            Total Projects
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects included in selected period
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            Delayed Projects
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects currently reported as delayed
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            Average Delay
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Average delay across selected projects
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-muted">
            High Risk Projects
          </p>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Projects currently in high or critical risk
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <TrendingUp
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                Delay Trend
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Project delay trend over the selected period.
              </p>
            </div>
          </div>

          <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center sm:min-h-[300px]">
            <div className="max-w-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
                <TrendingUp
                  size={21}
                  strokeWidth={2}
                  className="text-muted"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-text">
                Delay trend data unavailable
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Historical project performance data will be visualized here
                when analytics data is available.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <BarChart3
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                Risk Distribution
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Distribution of projects across risk categories.
              </p>
            </div>
          </div>

          <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center sm:min-h-[300px]">
            <div className="max-w-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
                <BarChart3
                  size={21}
                  strokeWidth={2}
                  className="text-muted"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-text">
                Risk distribution unavailable
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Low, medium, high, and critical risk distribution will appear
                here when prediction data is connected.
              </p>
            </div>
          </div>
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
              State & District Comparison
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Compare project performance and delay indicators across
              administrative regions.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead className="border-b border-border bg-page">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Region
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Projects
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Delayed
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    High Risk
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Avg. Delay
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <p className="text-sm font-semibold text-text">
                      Regional analytics unavailable
                    </p>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                      State and district comparison will appear here when
                      regional project data is available.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <BarChart3
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Project Type Comparison
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Compare acquisition performance across infrastructure project
              categories.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Highways
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Project data: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Railways
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Project data: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Metro
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Project data: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Other Infrastructure
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Project data: —
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <TrendingUp
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Performance Indicators
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Key indicators for monitoring project acquisition performance.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              On-Time Completion
            </p>

            <p className="mt-4 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Approval Efficiency
            </p>

            <p className="mt-4 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Compensation Progress
            </p>

            <p className="mt-4 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Possession Progress
            </p>

            <p className="mt-4 min-h-8 text-2xl font-bold text-text">—</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Analytics