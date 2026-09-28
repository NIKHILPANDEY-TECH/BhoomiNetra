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
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "../lib/api"

export default function Recommendations() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get("project")

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  useEffect(() => {
    if (!projectId) {
      setRecommendations([])
      setLoading(false)
      return
    }

    const loadRecommendations = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          `/api/projects/${encodeURIComponent(projectId)}/recommendations`
        )

        // Support both Axios responses and API clients/interceptors
        // that already unwrap response.data.
        const payload = response?.data ?? response
        const recommendationData = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : []

        console.log("Recommendation API response:", response)
        console.log("Recommendation payload:", payload)
        console.log("Parsed recommendations:", recommendationData)

        setRecommendations(recommendationData)
      } catch (err) {
        console.error(
          "Recommendation loading error:",
          err
        )

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load recommendations."
        )

        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [projectId])

  const highPriorityCount = recommendations.filter(
    (item) => item.priority === "HIGH"
  ).length

  const pendingActions = recommendations.filter(
    (item) => !["COMPLETED", "RESOLVED"].includes(item?.status)
  ).length

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

      {/* Back */}
      <div className="mb-6">
        <Link
          to={
            projectId
              ? `/projects/${projectId}`
              : "/projects"
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft
            size={17}
            strokeWidth={2}
          />

          Back to{" "}
          {isProjectManager
            ? "My Project Details"
            : "Project Details"}
        </Link>
      </div>

      {/* Header */}
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
            Recommended actions based on current project
            conditions, bottlenecks, and risk context.
          </p>

        </div>

        <div className="text-sm text-muted">
          Project ID:{" "}
          <span className="break-all font-medium text-text">
            {projectId || "—"}
          </span>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Recommendations"
          value={loading ? "…" : recommendations.length}
          description="Generated project actions"
          icon={<Lightbulb size={19} />}
        />

        <KpiCard
          title="High Priority"
          value={loading ? "…" : highPriorityCount}
          description="Immediate attention required"
          icon={<AlertCircle size={19} />}
        />

        <KpiCard
          title="Actionable"
          value={loading ? "…" : recommendations.length}
          description="Deterministic recommendations"
          icon={<TrendingUp size={19} />}
        />

        <KpiCard
          title="Pending Actions"
          value={loading ? "…" : pendingActions}
          description="Actions awaiting execution"
          icon={<Clock3 size={19} />}
        />

      </div>

      {/* Summary */}
      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">

        <div className="flex items-start gap-3">

          <Target
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Recommendation Summary
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Recommended interventions based on the
              current project conditions and detected
              bottlenecks.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="mt-6 rounded-lg border border-border bg-page px-5 py-10 text-center">
            <p className="text-sm font-medium text-muted">
              Loading recommendation engine…
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
              <Lightbulb
                size={21}
                className="text-saffron"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-text">
              No recommendations returned
            </p>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
              The recommendation engine did not return
              any actionable recommendation for the current
              project state.
            </p>

          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-page p-5">

            <p className="text-sm font-semibold text-text">
              {recommendations.length} recommendation
              {recommendations.length !== 1 ? "s" : ""} generated
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              The following actions were generated from
              the project's current risk, approval,
              bottleneck, and project-condition rules.
            </p>

          </div>
        )}

      </div>

      {/* Recommendation table */}
      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">

        <div className="flex items-start gap-3">

          <FileText
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Recommended Actions
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Actions are generated using deterministic
              recommendation rules.
            </p>
          </div>

        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">

          {loading ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-medium text-muted">
                Loading recommendations…
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="px-5 py-14 text-center">

              <p className="text-sm font-semibold text-text">
                No recommendations available
              </p>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                No recommendation was returned for this
                project's current conditions.
              </p>

            </div>
          ) : (
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
                    Source
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {recommendations.map((item, index) => (

                  <tr
                    key={`${item.recommendation}-${index}`}
                    className="border-b border-border last:border-b-0"
                  >

                    <td className="px-5 py-5 align-top">

                      <div className="flex items-start gap-3">

                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-saffron"
                        />

                        <div>
                          <p className="text-sm font-semibold text-text">
                            {item.recommendation}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-5 align-top">

                      <p className="max-w-md text-sm leading-6 text-muted">
                        {item.reason || "—"}
                      </p>

                    </td>

                    <td className="px-5 py-5 align-top">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.priority === "HIGH"
                            ? "bg-red-50 text-red-700"
                            : item.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {item.priority || "LOW"}
                      </span>

                    </td>

                    <td className="px-5 py-5 align-top">

                      <span className="text-xs font-medium text-muted">
                        {item.source || "deterministic_rule"}
                      </span>

                    </td>

                    <td className="px-5 py-5 align-top">

                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text">
                        <CheckCircle2
                          size={15}
                          className="text-green"
                        />
                        {item.status || "RECOMMENDED"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </section>
  )
}

function KpiCard({
  title,
  value,
  description,
  icon
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-center justify-between gap-3">

        <p className="text-sm font-medium text-muted">
          {title}
        </p>

        <span className="shrink-0 text-saffron">
          {icon}
        </span>

      </div>

      <p className="mt-3 min-h-8 text-2xl font-bold text-text">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-muted">
        {description}
      </p>

    </div>
  )
}