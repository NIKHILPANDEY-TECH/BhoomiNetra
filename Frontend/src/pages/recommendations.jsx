import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Lightbulb,
  Search,
  Target,
  TrendingUp,
  X,
} from "lucide-react"

import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { api } from "../lib/api"


export default function Recommendations() {
  const [searchParams, setSearchParams] = useSearchParams()

  const projectId = searchParams.get("project")

  const [projects, setProjects] = useState([])
  const [recommendations, setRecommendations] = useState([])

  const [selectedProject, setSelectedProject] = useState(null)

  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false)

  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [selectorOpen, setSelectorOpen] = useState(false)


  /*
   * ---------------------------------------------------------
   * LOAD PROJECTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true)
        setError("")

        const response = await api.get(
          "/api/projects?page=1&limit=100"
        )

        const payload = response?.data ?? response

        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []

        setProjects(data)

        /*
         * If a project ID already exists in the URL,
         * find that project automatically.
         */
        if (projectId) {
          const found = data.find(
            (project) =>
              String(
                project.project_id ??
                project.public_id ??
                project.id
              ) === String(projectId)
          )

          if (found) {
            setSelectedProject(found)
          }
        }
      } catch (err) {
        console.error(
          "Project loading error:",
          err
        )

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load projects."
        )
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [projectId])


  /*
   * ---------------------------------------------------------
   * LOAD RECOMMENDATIONS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) {
      setRecommendations([])
      return
    }

    const loadRecommendations = async () => {
      try {
        setLoadingRecommendations(true)
        setError("")

        const response = await api.get(
          `/api/projects/${encodeURIComponent(
            projectId
          )}/recommendations`
        )

        console.log(
          "Recommendation API response:",
          response.data
        )

        const payload = response?.data ?? response

        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []

        setRecommendations(data)
      } catch (err) {
        console.error(
          "Recommendation loading error:",
          err
        )

        setRecommendations([])

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load recommendations."
        )
      } finally {
        setLoadingRecommendations(false)
      }
    }

    loadRecommendations()
  }, [projectId])


  /*
   * ---------------------------------------------------------
   * SELECT PROJECT
   * ---------------------------------------------------------
   */

  const selectProject = (project) => {
    const id =
      project?.project_id ??
      project?.public_id ??
      project?.id

    if (!id) return

    setSelectedProject(project)
    setSelectorOpen(false)
    setSearch("")

    setSearchParams({
      project: String(id),
    })
  }


  /*
   * ---------------------------------------------------------
   * CLEAR PROJECT
   * ---------------------------------------------------------
   */

  const clearProject = () => {
    setSelectedProject(null)
    setRecommendations([])
    setError("")
    setSearch("")
    setSelectorOpen(false)

    setSearchParams({})
  }


  /*
   * ---------------------------------------------------------
   * FILTER PROJECTS
   * ---------------------------------------------------------
   */

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return projects
    }

    return projects.filter((project) => {
      const id = String(
        project.project_id ??
        project.public_id ??
        project.id ??
        ""
      ).toLowerCase()

      const name = String(
        project.project_name ??
        project.name ??
        ""
      ).toLowerCase()

      const state = String(
        project.state ?? ""
      ).toLowerCase()

      const district = String(
        project.district ?? ""
      ).toLowerCase()

      return (
        id.includes(query) ||
        name.includes(query) ||
        state.includes(query) ||
        district.includes(query)
      )
    })
  }, [projects, search])


  /*
   * ---------------------------------------------------------
   * PROJECT DISPLAY HELPERS
   * ---------------------------------------------------------
   */

  const getProjectId = (project) =>
    project?.project_id ??
    project?.public_id ??
    project?.id ??
    ""

  const getProjectName = (project) =>
    project?.project_name ??
    project?.name ??
    "Unnamed Project"

  const getProjectState = (project) =>
    project?.state ?? "—"

  const getProjectDistrict = (project) =>
    project?.district ?? "—"

  const getProjectType = (project) =>
    project?.project_type ??
    project?.type ??
    "—"


  /*
   * ---------------------------------------------------------
   * KPI DATA
   * ---------------------------------------------------------
   */

  const highPriorityCount =
    recommendations.filter(
      (item) => item.priority === "HIGH"
    ).length

  const pendingActions =
    recommendations.filter(
      (item) =>
        item.status !== "COMPLETED" &&
        item.status !== "RESOLVED"
    ).length


  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
 */

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

      {/* =====================================================
          BACK
      ====================================================== */}

      <div className="mb-6">

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft size={17} />

          Back to Projects
        </Link>

      </div>


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-saffron sm:text-sm">
            Project Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Recommendations
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Recommended actions based on current project
            conditions, bottlenecks, and risk context.
          </p>

        </div>

        {selectedProject && (
          <div className="text-sm text-muted">

            Project ID:{" "}

            <span className="break-all font-medium text-text">
              {getProjectId(selectedProject)}
            </span>

          </div>
        )}

      </div>


      {/* =====================================================
          PROJECT SELECTOR
      ====================================================== */}

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">

        <div className="flex items-start gap-3">

          <Target
            size={21}
            className="mt-0.5 shrink-0 text-saffron"
          />

          <div className="min-w-0 flex-1">

            <h2 className="text-lg font-bold text-text">
              Select Project
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Choose a project to generate and view its
              recommendations.
            </p>

          </div>

          {selectedProject && (
            <button
              type="button"
              onClick={clearProject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-page hover:text-text"
            >
              <X size={14} />

              Change Project
            </button>
          )}

        </div>


        {/* Selected Project */}

        {selectedProject ? (

          <div className="mt-5 rounded-lg border border-saffron/30 bg-page p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Selected Project
                  </span>

                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-saffron">
                    {getProjectId(selectedProject)}
                  </span>

                </div>

                <h3 className="mt-2 text-lg font-bold text-text">
                  {getProjectName(selectedProject)}
                </h3>

                <p className="mt-1 text-sm text-muted">
                  {getProjectDistrict(selectedProject)},
                  {" "}
                  {getProjectState(selectedProject)}
                  {" · "}
                  {getProjectType(selectedProject)}
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProject(null)
                  setRecommendations([])
                  setError("")
                  setSelectorOpen(true)
                  setSearch("")
                  setSearchParams({})
                }}
                className="shrink-0 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text transition hover:border-saffron hover:text-saffron"
              >
                Select Another
              </button>

            </div>

          </div>

        ) : (

          /* Project Dropdown */

          <div className="relative mt-5">

            <button
              type="button"
              onClick={() =>
                setSelectorOpen((value) => !value)
              }
              className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3.5 text-left text-sm transition hover:border-saffron focus:border-saffron focus:outline-none"
            >

              <div className="flex min-w-0 items-center gap-3">

                <Search
                  size={18}
                  className="shrink-0 text-muted"
                />

                <span className="truncate text-muted">
                  {loadingProjects
                    ? "Loading projects..."
                    : "Search and select a project"}
                </span>

              </div>

              <ChevronDown
                size={18}
                className={`shrink-0 text-muted transition ${
                  selectorOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>


            {selectorOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-xl">

                {/* Search */}

                <div className="border-b border-border p-3">

                  <div className="relative">

                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      autoFocus
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search by project ID, name, state or district..."
                      className="h-11 w-full rounded-lg border border-border bg-page pl-10 pr-3 text-sm outline-none focus:border-saffron"
                    />

                  </div>

                </div>


                {/* Project List */}

                <div className="max-h-[360px] overflow-y-auto">

                  {loadingProjects ? (

                    <div className="px-5 py-10 text-center">

                      <p className="text-sm font-medium text-muted">
                        Loading projects...
                      </p>

                    </div>

                  ) : filteredProjects.length === 0 ? (

                    <div className="px-5 py-10 text-center">

                      <p className="text-sm font-semibold text-text">
                        No projects found
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Try another project ID, name,
                        state or district.
                      </p>

                    </div>

                  ) : (

                    filteredProjects.map((project) => {

                      const id = getProjectId(project)

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            selectProject(project)
                          }
                          className="w-full border-b border-border px-4 py-3.5 text-left transition last:border-b-0 hover:bg-page"
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-text">
                                {getProjectName(project)}
                              </p>

                              <p className="mt-1 text-xs text-muted">
                                {getProjectDistrict(project)},
                                {" "}
                                {getProjectState(project)}
                                {" · "}
                                {getProjectType(project)}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-full bg-page px-2.5 py-1 text-xs font-semibold text-saffron">
                              {id}
                            </span>

                          </div>

                        </button>
                      )
                    })
                  )}

                </div>

              </div>
            )}

          </div>

        )}

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          NO PROJECT SELECTED
      ====================================================== */}

      {!selectedProject && !projectId && (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-white px-5 py-14 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-page">

            <Lightbulb
              size={24}
              className="text-saffron"
            />

          </div>

          <h2 className="mt-4 text-lg font-bold text-text">
            Select a project to continue
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Choose a project above to view recommendations
            generated from its current risk, approval,
            bottleneck and project conditions.
          </p>

        </div>
      )}


      {/* =====================================================
          PROJECT SELECTED
      ====================================================== */}

      {selectedProject && (
        <>

          {/* KPI CARDS */}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Recommendations"
              value={
                loadingRecommendations
                  ? "…"
                  : recommendations.length
              }
              description="Generated project actions"
              icon={<Lightbulb size={19} />}
            />

            <KpiCard
              title="High Priority"
              value={
                loadingRecommendations
                  ? "…"
                  : highPriorityCount
              }
              description="Immediate attention required"
              icon={<AlertCircle size={19} />}
            />

            <KpiCard
              title="Actionable"
              value={
                loadingRecommendations
                  ? "…"
                  : recommendations.length
              }
              description="Deterministic recommendations"
              icon={<TrendingUp size={19} />}
            />

            <KpiCard
              title="Pending Actions"
              value={
                loadingRecommendations
                  ? "…"
                  : pendingActions
              }
              description="Actions awaiting execution"
              icon={<Clock3 size={19} />}
            />

          </div>


          {/* SUMMARY */}

          <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start gap-3">

              <Target
                size={21}
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


            {loadingRecommendations ? (

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
                  any actionable recommendation for the
                  current project state.
                </p>

              </div>

            ) : (

              <div className="mt-6 rounded-lg border border-border bg-page p-5">

                <p className="text-sm font-semibold text-text">
                  {recommendations.length} recommendation
                  {recommendations.length !== 1
                    ? "s"
                    : ""}{" "}
                  generated
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  The following actions were generated from
                  the project's current risk, approval,
                  bottleneck and project-condition rules.
                </p>

              </div>
            )}

          </div>


          {/* RECOMMENDATION TABLE */}

          <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start gap-3">

              <FileText
                size={21}
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

              {loadingRecommendations ? (

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

                    {recommendations.map(
                      (item, index) => (

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

                              <p className="text-sm font-semibold text-text">
                                {item.recommendation}
                              </p>

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
                              {item.source ||
                                "deterministic_rule"}
                            </span>

                          </td>


                          <td className="px-5 py-5 align-top">

                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text">

                              <CheckCircle2
                                size={15}
                                className="text-green"
                              />

                              {item.status ||
                                "RECOMMENDED"}

                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </>
      )}

    </section>
  )
}


/*
 * ===========================================================
 * KPI CARD
 * ===========================================================
 */

function KpiCard({
  title,
  value,
  description,
  icon,
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