import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

function Recommendations() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get("project")

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6">
        <Link
          to={projectId ? `/projects/${projectId}` : "/projects"}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
          Back to{" "}
          {isProjectManager ? "My Project Details" : "Project Details"}
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron sm:text-sm">
            {isProjectManager
              ? "My Project Intelligence"
              : "Administrative Project Intelligence"}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Recommendations
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Review actionable recommendations based on identified project
            risks, delay factors, and acquisition progress.
          </p>
        </div>

        <div className="text-sm text-muted">
          Project ID:{" "}
          <span className="break-all font-medium text-text">
            {projectId || "—"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Recommendations
            </p>

            <Lightbulb
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Model-generated actions
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              High Priority
            </p>

            <AlertCircle
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Immediate attention required
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Expected Impact
            </p>

            <TrendingUp
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Predicted improvement
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Pending Actions
            </p>

            <Clock3
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Actions awaiting execution
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Target
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Recommendation Summary
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Recommended interventions based on current project conditions.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
            <Lightbulb
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-text">
            Recommendation data unavailable
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            The recommendation engine will provide project-specific actions
            after the project data and prediction model are connected.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <FileText
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Recommended Actions
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Actions will be prioritized according to their expected impact.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="min-w-[850px] w-full">
            <thead className="border-b border-border bg-page">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Action
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Reason
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Priority
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Expected Impact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="5" className="px-5 py-14 text-center">
                  <p className="text-sm font-semibold text-text">
                    No recommendations available
                  </p>

                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                    Model-generated actions will appear here once the
                    recommendation data is available.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <AlertCircle
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              Immediate Actions
            </h2>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-page p-4">
            <p className="text-sm font-medium text-muted">
              Priority actions
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              High-priority interventions will be identified from current
              project risks.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Clock3
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              Short-Term Actions
            </h2>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-page p-4">
            <p className="text-sm font-medium text-muted">
              Upcoming interventions
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              Short-term actions will be generated from predicted project
              conditions.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <TrendingUp
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              Preventive Actions
            </h2>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-page p-4">
            <p className="text-sm font-medium text-muted">
              Delay prevention
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              Preventive recommendations will focus on reducing future delay
              risk.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Action Tracking
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Track implementation status of recommended interventions.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Pending
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              In Progress
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Completed
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Recommendations