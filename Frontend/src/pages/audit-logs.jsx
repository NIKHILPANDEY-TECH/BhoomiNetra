import {
  Activity,
  CalendarDays,
  Filter,
  Search,
  ShieldCheck,
  User
} from "lucide-react"
import { Link } from "react-router-dom"

function AuditLogs() {
  const role = localStorage.getItem("bhoomiRole")
  const isAdministrative = role === "administrative"

  if (!isAdministrative) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-132px)] max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
            <ShieldCheck
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
            Audit logs are available only to administrative users.
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
            Administrative Control
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Audit Logs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Track user activity, system actions, and important administrative
            events across the BhoomiNETRA platform.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
          <span>System Activity</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Total Activities
            </p>

            <Activity
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Recorded system activities
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              User Actions
            </p>

            <User
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Actions performed by users
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              System Events
            </p>

            <ShieldCheck
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Automated system events
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Activity Period
            </p>

            <CalendarDays
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Selected audit period
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <input
              type="text"
              placeholder="Search user, action, or module"
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              Module
            </option>

            <option value="all">All Modules</option>
          </select>

          <select
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          >
            <option value="" disabled>
              Action
            </option>

            <option value="all">All Actions</option>
          </select>

          <div className="relative">
            <CalendarDays
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />

            <input
              type="date"
              className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

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
              Activity History
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Recorded platform activities and administrative events.
            </p>
          </div>

          <span className="shrink-0 text-sm font-medium text-muted">
            — Activities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="border-b border-border bg-page">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Date & Time
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Module
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Action
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
                      <Activity
                        size={20}
                        strokeWidth={2}
                        className="text-muted"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-text">
                      No audit activity available
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      User and system activity will appear here when audit log
                      data is connected.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default AuditLogs