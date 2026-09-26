import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Target,
  TrendingUp
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

function StagePrediction() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get("project")

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  const stages = [
    "Land Identification",
    "Notification",
    "Compensation",
    "Possession",
    "Rehabilitation & Resettlement"
  ]

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
            Stage Prediction
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Monitor the current acquisition stage and understand the predicted
            progression of the project.
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
            <p className="text-sm font-medium text-muted">Current Stage</p>

            <Flag
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Current project lifecycle stage
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Predicted Stage</p>

            <Target
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Model-predicted next stage
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Expected Timeline
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
            Predicted time to next stage
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Stage Risk</p>

            <TrendingUp
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Risk associated with stage progression
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Flag
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Acquisition Lifecycle
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Current and predicted stage progression.
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-[850px] items-start">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-1 items-start">
                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-page">
                    <span className="text-sm font-semibold text-muted">
                      {index + 1}
                    </span>
                  </div>

                  <p className="mt-3 max-w-32 text-sm font-semibold leading-5 text-text">
                    {stage}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Status: —
                  </p>
                </div>

                {index < stages.length - 1 && (
                  <div className="mt-5 flex flex-1 items-center px-2">
                    <div className="h-px w-full bg-border" />

                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-muted"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Target
              size={21}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Current Stage Assessment
            </h2>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-medium text-muted">
              Current stage
            </p>

            <p className="mt-3 text-2xl font-bold text-text">—</p>

            <p className="mt-3 text-sm leading-6 text-muted">
              The current acquisition stage will be determined from project
              progress and acquisition records.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-page p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Completion
              </p>

              <p className="mt-3 min-h-7 text-lg font-bold text-text">—</p>
            </div>

            <div className="rounded-lg border border-border bg-page p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Stage Risk
              </p>

              <p className="mt-3 min-h-7 text-lg font-bold text-text">—</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Clock3
              size={21}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Predicted Next Stage
            </h2>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-medium text-muted">
              Model prediction
            </p>

            <p className="mt-3 text-2xl font-bold text-text">—</p>

            <p className="mt-3 text-sm leading-6 text-muted">
              The predicted next stage and expected transition timeline will
              appear here after model processing.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-border px-5 py-4">
            <p className="text-sm font-semibold text-text">
              Expected transition
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Expected date or duration will be provided by the prediction
              system.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Clock3
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Stage Delay Assessment
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Stage-wise factors affecting progression.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Approval Processing
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Approval timeline impact will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Impact: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Compensation Progress
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Compensation progress impact will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Impact: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Possession Readiness
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Possession readiness impact will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Impact: —
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2
            size={21}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <h2 className="text-lg font-bold text-text">
            Prediction Summary
          </h2>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-8 text-center">
          <p className="text-sm font-semibold text-text">
            Prediction data unavailable
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            Stage prediction results will appear here when the project data and
            prediction model are connected.
          </p>
        </div>
      </div>
    </section>
  )
}

export default StagePrediction