import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CircleAlert,
  FileWarning,
  ShieldAlert,
  TrendingUp
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

function RiskAnalysis() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get("project")
  const view = searchParams.get("view") || "risk"

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"
  const isDelayView = view === "delay"

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6">
        <Link
          to={projectId ? `/projects/${projectId}` : "/projects"}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
          Back to {isProjectManager ? "My Project Details" : "Project Details"}
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
            {isDelayView ? "Delay Analysis" : "Risk Analysis"}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            {isDelayView
              ? "Analyze predicted delay probability and understand the major causes contributing to potential project delay."
              : "Analyze project risk, predicted delay probability, and the factors contributing to potential project delays."}
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
            <p className="text-sm font-medium text-muted">Overall Risk</p>

            <ShieldAlert
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Model-generated risk classification
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Delay Probability
            </p>

            <TrendingUp
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Predicted probability of delay
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">Risk Factors</p>

            <CircleAlert
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Identified contributing factors
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Analysis Type
            </p>

            <BarChart3
              size={19}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 min-h-8 text-xl font-bold text-text">
            {isDelayView ? "Delay" : "Risk"}
          </p>

          <p className="mt-2 text-xs leading-5 text-muted">
            Current analysis view
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            {isDelayView ? (
              <AlertTriangle
                size={21}
                strokeWidth={2}
                className="shrink-0 text-saffron"
                aria-hidden="true"
              />
            ) : (
              <ShieldAlert
                size={21}
                strokeWidth={2}
                className="shrink-0 text-saffron"
                aria-hidden="true"
              />
            )}

            <h2 className="text-lg font-bold text-text">
              {isDelayView
                ? "Brief Delay Analysis"
                : "Brief Risk Analysis"}
            </h2>
          </div>

          {isDelayView ? (
            <div className="mt-6 rounded-lg border border-border bg-page p-5 sm:p-6">
              <p className="text-sm font-semibold text-text">
                Delay assessment
              </p>

              <p className="mt-3 text-sm leading-7 text-muted">
                The system will explain the predicted delay probability and
                identify the major causes contributing to the potential delay.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-border bg-page p-5 sm:p-6">
              <p className="text-sm font-semibold text-text">
                Risk assessment
              </p>

              <p className="mt-3 text-sm leading-7 text-muted">
                The system will summarize the project's overall risk level,
                risk score, and major contributing factors.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-page p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {isDelayView ? "Delay Category" : "Risk Category"}
              </p>

              <p className="mt-3 min-h-7 text-lg font-bold text-text">—</p>
            </div>

            <div className="rounded-lg border border-border bg-page p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {isDelayView ? "Delay Probability" : "Risk Score"}
              </p>

              <p className="mt-3 min-h-7 text-lg font-bold text-text">—</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={21}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h2 className="text-lg font-bold text-text">
              Delay Chances
            </h2>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-page p-5 text-center">
            <p className="text-sm font-medium text-muted">
              Predicted delay probability
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight text-text">
              —
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              Prediction output will appear here after the model processes the
              project data.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-text">
              Delay interpretation
            </p>

            <div className="mt-3 rounded-lg border border-border px-4 py-4">
              <p className="text-sm leading-6 text-muted">
                The system will explain the predicted delay level and identify
                the major causes behind the prediction.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <FileWarning
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              {isDelayView
                ? "Key Delay Drivers"
                : "Key Risk Drivers"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              {isDelayView
                ? "Factors contributing to the predicted project delay."
                : "Factors contributing to project risk and potential delay."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Pending Approvals
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Approval-related contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Compensation Delays
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Compensation-related contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Legal Disputes
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Legal-related contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Documentation
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Documentation-related contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Rehabilitation Progress
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              R&R-related contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-sm font-semibold text-text">
              Administrative Bottlenecks
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Administrative contribution will appear here.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-2 w-0 rounded-full bg-saffron" />
            </div>

            <p className="mt-2 text-xs text-muted">
              Contribution: —
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <FileWarning
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Delay Causes
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Major causes that may contribute to project delay.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border px-5 py-4">
            <p className="text-sm font-semibold text-text">
              Approval Delays
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Details about pending approvals and expected impact will appear
              here.
            </p>
          </div>

          <div className="rounded-lg border border-border px-5 py-4">
            <p className="text-sm font-semibold text-text">
              Compensation Issues
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Details about compensation status and related delay risk will
              appear here.
            </p>
          </div>

          <div className="rounded-lg border border-border px-5 py-4">
            <p className="text-sm font-semibold text-text">
              Legal Disputes
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Details about legal cases and their possible schedule impact will
              appear here.
            </p>
          </div>

          <div className="rounded-lg border border-border px-5 py-4">
            <p className="text-sm font-semibold text-text">
              Documentation Gaps
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Missing or incomplete documents affecting acquisition progress
              will appear here.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RiskAnalysis