import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert
} from "lucide-react"

function Alerts() {
  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron sm:text-sm">
            {isProjectManager
              ? "My Project Notifications"
              : "Administrative Notifications"}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Alerts
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            {isProjectManager
              ? "Review risk, delay, recommendation, and system notifications related to your assigned projects."
              : "Review important project risk, delay, recommendation, and system notifications."}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <Bell
            size={18}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <span>
            {isProjectManager
              ? "My Notifications"
              : "Notifications Centre"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Total Alerts
            </p>

            <Bell
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Unread Alerts
            </p>

            <AlertTriangle
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              High-Risk Alerts
            </p>

            <ShieldAlert
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Delay Alerts
            </p>

            <Clock3
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <input
              type="text"
              placeholder={
                isProjectManager
                  ? "Search my alerts or projects"
                  : "Search alerts or projects"
              }
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              Alert Type
            </option>

            <option value="all">All Alert Types</option>
            <option value="risk">High Risk</option>
            <option value="delay">Delay</option>
            <option value="recommendation">Recommendation</option>
            <option value="system">System</option>
          </select>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              Status
            </option>

            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
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
              Alert History
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              {isProjectManager
                ? "Important notifications generated for your assigned projects."
                : "Important notifications generated for monitored projects."}
            </p>
          </div>

          <span className="shrink-0 text-sm font-medium text-muted">
            — Alerts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full">
            <thead className="border-b border-border bg-page">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Alert
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Project
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Date & Time
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="5" className="px-5 py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
                      <Bell
                        size={20}
                        strokeWidth={2}
                        className="text-muted"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-text">
                      No alerts available
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      {isProjectManager
                        ? "Risk, delay, recommendation, and system alerts for your assigned projects will appear here when notification data is connected."
                        : "Risk, delay, recommendation, and system alerts will appear here when notification data is connected."}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <AlertTriangle
            size={21}
            strokeWidth={2}
            className="text-saffron"
            aria-hidden="true"
          />

          <h2 className="mt-4 text-base font-bold text-text">
            High-Risk Alerts
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Notifications when monitored projects enter high or critical risk
            conditions.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <Clock3
            size={21}
            strokeWidth={2}
            className="text-saffron"
            aria-hidden="true"
          />

          <h2 className="mt-4 text-base font-bold text-text">
            Delay Alerts
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Notifications about predicted or recorded delays affecting project
            progress.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <CheckCircle2
            size={21}
            strokeWidth={2}
            className="text-saffron"
            aria-hidden="true"
          />

          <h2 className="mt-4 text-base font-bold text-text">
            Recommendation Alerts
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Notifications when new recommendations or intervention actions
            become available.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Alerts