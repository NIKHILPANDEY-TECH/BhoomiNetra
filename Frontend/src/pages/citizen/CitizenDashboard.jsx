import { ArrowRight, FileText, MapPin, MapPinned, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"

export default function CitizenDashboard() {
  const [summary, setSummary] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    Promise.all([
      api.get("/api/citizen/summary"),
      api.get("/api/citizen/projects?page=1&limit=5"),
    ])
      .then(([summaryResponse, projectResponse]) => {
        if (!active) return
        setSummary(summaryResponse?.data || {})
        setProjects(Array.isArray(projectResponse?.data) ? projectResponse.data : [])
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load your local dashboard.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const cards = [
    { label: "Public projects in your area", value: summary?.total_projects ?? "—", icon: MapPin },
    { label: "Active projects", value: summary?.active_projects ?? "—", icon: MapPinned },
    { label: "Reports submitted by you", value: summary?.my_reports ?? "—", icon: FileText },
    { label: "Reports awaiting review", value: summary?.open_reports ?? "—", icon: ShieldCheck },
  ]

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="rounded-2xl bg-gradient-to-r from-green to-emerald-800 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Local Citizen Portal</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Projects in your area</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          View published land-acquisition project updates for your assigned district and submit a concern about a local project.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">{summary?.district || "Assigned district"}</span>
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">{summary?.state || "Assigned state"}</span>
        </div>
      </div>

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted">{label}</p>
              <span className="rounded-lg bg-page p-2 text-green"><Icon size={19} /></span>
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div><h2 className="text-lg font-bold text-text">Recently updated projects</h2><p className="mt-1 text-sm text-muted">Only published projects within your assigned district are shown.</p></div>
            <Link to="/citizen/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-green">All local projects <ArrowRight size={16} /></Link>
          </div>
          {loading ? <p className="p-6 text-sm text-muted">Loading local projects…</p> : projects.length === 0 ? (
            <div className="p-8 text-center"><MapPin className="mx-auto text-muted" size={28} /><p className="mt-3 font-semibold text-text">No published projects found</p><p className="mt-1 text-sm text-muted">There are currently no published project records available for your assigned district.</p></div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project) => (
                <div key={project.public_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0"><p className="font-semibold text-text">{project.project_name}</p><p className="mt-1 text-xs text-muted">{project.public_id} · {project.district}, {project.state}</p><p className="mt-2 text-sm text-muted">Stage: {project.current_stage} · Status: {project.status}</p></div>
                  <Link to={`/citizen/projects/${encodeURIComponent(project.public_id)}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-green hover:text-green">View update <ArrowRight size={15} /></Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-text">Quick actions</h2>
          <p className="mt-1 text-sm text-muted">Access local project information and keep track of concerns you submit.</p>
          <div className="mt-5 grid gap-3">
            <Link to="/citizen/map" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-green hover:bg-page"><MapPinned className="text-green" size={21} /><span><span className="block text-sm font-semibold text-text">Explore local map</span><span className="mt-1 block text-xs text-muted">View published projects on OpenStreetMap.</span></span></Link>
            <Link to="/citizen/reports" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-green hover:bg-page"><FileText className="text-green" size={21} /><span><span className="block text-sm font-semibold text-text">Report a concern</span><span className="mt-1 block text-xs text-muted">Submit an issue and track your own reports.</span></span></Link>
          </div>
          <p className="mt-5 rounded-lg bg-page p-3 text-xs leading-5 text-muted">This portal shows approved public project information. Individual compensation records, internal ML analysis, and officer-only notes are not available here.</p>
        </section>
      </div>
    </section>
  )
}
