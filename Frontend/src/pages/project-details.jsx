import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Lightbulb,
  MapPin,
  ShieldAlert,
  Target,
  TrendingUp
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

function ProjectDetails() {
  const { id } = useParams()

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
          {isProjectManager ? "Back to My Projects" : "Back to Projects"}
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6 lg:mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
              Project Details
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Project Overview
            </h1>

            <p className="mt-2 break-all text-sm text-muted">
              Project ID: {id || "—"}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
            <MapPin size={17} strokeWidth={2} aria-hidden="true" />
            <span>Location data unavailable</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Project Status</p>

            <CheckCircle2
              size={19}
              strokeWidth={2}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 min-h-8 text-xl font-bold text-text">—</div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Acquisition Progress
            </p>

            <TrendingUp
              size={19}
              strokeWidth={2}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 min-h-8 text-xl font-bold text-text">—</div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Risk Level</p>

            <ShieldAlert
              size={19}
              strokeWidth={2}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 min-h-8 text-xl font-bold text-text">—</div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Delay Probability</p>

            <Clock3
              size={19}
              strokeWidth={2}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 min-h-8 text-xl font-bold text-text">—</div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <FileText
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Project Information
            </h2>
          </div>

          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Project Type
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                State
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                District
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Land Area
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Affected Families
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Compensation Status
              </p>
              <p className="mt-2 text-sm font-medium text-text">—</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Risk Analysis
            </h2>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-medium text-muted">
              Overall Risk
            </p>

            <p className="mt-3 text-2xl font-bold text-text">—</p>

            <p className="mt-4 text-sm leading-6 text-muted">
              Risk assessment will appear here when prediction data is
              available.
            </p>

            <Link
              to={`/risk-analysis?project=${id || ""}&view=risk`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-saffron transition hover:text-green"
            >
              View detailed risk analysis
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Delay Chances
            </h2>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-muted">
              Predicted Delay Probability
            </p>

            <p className="mt-3 text-3xl font-bold text-text">—</p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-text">
                Possible Causes
              </p>

              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-border bg-page px-4 py-3 text-sm text-muted">
                  Pending approvals
                </div>

                <div className="rounded-lg border border-border bg-page px-4 py-3 text-sm text-muted">
                  Compensation delays
                </div>

                <div className="rounded-lg border border-border bg-page px-4 py-3 text-sm text-muted">
                  Legal disputes
                </div>
              </div>
            </div>

            <Link
              to={`/risk-analysis?project=${id || ""}&view=delay`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-saffron transition hover:text-green"
            >
              View delay analysis
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Gavel
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Approvals & Legal
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-page p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Approvals
              </p>

              <p className="mt-3 text-lg font-bold text-text">—</p>
            </div>

            <div className="rounded-lg border border-border bg-page p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Legal Cases
              </p>

              <p className="mt-3 text-lg font-bold text-text">—</p>
            </div>

            <div className="rounded-lg border border-border bg-page p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Legal Status
              </p>

              <p className="mt-3 text-sm font-medium text-text">—</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={20}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <h2 className="text-lg font-bold text-text">
            Risk Drivers & Recommendations
          </h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-page p-5">
            <h3 className="text-sm font-semibold text-text">
              Key Risk Drivers
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span className="text-sm leading-5 text-muted">
                  Pending documentation
                </span>

                <span className="shrink-0 text-sm font-semibold text-text">
                  —
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span className="text-sm leading-5 text-muted">
                  Approval timeline
                </span>

                <span className="shrink-0 text-sm font-semibold text-text">
                  —
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm leading-5 text-muted">
                  Rehabilitation progress
                </span>

                <span className="shrink-0 text-sm font-semibold text-text">
                  —
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <div className="flex items-center gap-2">
              <Lightbulb
                size={18}
                strokeWidth={2}
                className="shrink-0 text-saffron"
                aria-hidden="true"
              />

              <h3 className="text-sm font-semibold text-text">
                Recommended Actions
              </h3>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted">
              Predictive recommendations for this project will appear here
              when model output is available.
            </p>

            <Link
              to={`/recommendations?project=${id || ""}`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-saffron transition hover:text-green"
            >
              View recommendations
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Link
          to={`/stage-prediction?project=${id || ""}`}
          className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-saffron hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <Target
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              Stage Prediction
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted">
            View current stage, predicted next stage, and expected transition.
          </p>

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron">
            Open Stage Prediction
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </Link>

        <Link
          to={`/recommendations?project=${id || ""}`}
          className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-saffron hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <Lightbulb
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              Recommendations
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted">
            Review recommended interventions and actions for the project.
          </p>

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron">
            Open Recommendations
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </Link>

        <Link
          to={`/what-if?project=${id || ""}`}
          className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-saffron hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <TrendingUp
              size={20}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-base font-bold text-text">
              What-If Analysis
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted">
            Simulate changes and compare their possible effect on project risk
            and delay.
          </p>

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron">
            Open What-If
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </Link>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={20}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <h2 className="text-lg font-bold text-text">
            Project Timeline
          </h2>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
          <p className="text-sm font-semibold text-text">
            Timeline data unavailable
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            Project milestones and acquisition events will appear here when
            timeline data is available.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetails