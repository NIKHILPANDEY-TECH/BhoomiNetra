import { ArrowLeft, CalendarDays, MapPin, MapPinned } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../../lib/api"

function Progress({ label, value }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0))
  return <div><div className="mb-2 flex justify-between gap-3 text-sm"><span className="text-muted">{label}</span><span className="font-semibold text-text">{progress.toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-page"><div className="h-full rounded-full bg-green transition-all" style={{ width: `${progress}%` }} /></div></div>
}

export default function CitizenProjectDetails() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError("")
    api.get(`/api/citizen/projects/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((response) => setProject(response?.data || null))
      .catch((err) => { if (err?.name !== "AbortError") setError(err?.message || "Unable to load this public project update.") })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id])

  return <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
    <Link to="/citizen/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-green"><ArrowLeft size={16} /> Back to local projects</Link>
    {loading ? <div className="mt-6 rounded-xl border border-border bg-white p-10 text-center text-sm text-muted">Loading project update…</div> : error ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}<p className="mt-3"><Link to="/citizen/projects" className="font-semibold underline">Return to local projects</Link></p></div> : project && <>
      <div className="mt-5 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Public project update · {project.public_id}</p><h1 className="mt-2 text-3xl font-bold text-text">{project.project_name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted"><MapPin size={16} /> {project.district}, {project.state}</p></div><span className="rounded-full bg-green/10 px-3 py-1.5 text-sm font-semibold text-green">{project.status}</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-page p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Current acquisition stage</p><p className="mt-2 text-lg font-bold text-text">{project.current_stage}</p></div><div className="rounded-xl bg-page p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Project type</p><p className="mt-2 text-lg font-bold text-text">{project.project_type}</p></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-xl border border-border p-4"><CalendarDays className="text-green" size={21} /><div><p className="text-xs text-muted">Start date</p><p className="mt-1 text-sm font-semibold text-text">{project.project_start_date || "Not published"}</p></div></div><div className="flex items-center gap-3 rounded-xl border border-border p-4"><CalendarDays className="text-green" size={21} /><div><p className="text-xs text-muted">Planned completion</p><p className="mt-1 text-sm font-semibold text-text">{project.planned_completion_date || "Not published"}</p></div></div></div><div className="mt-7 space-y-5"><Progress label="Compensation progress (aggregate)" value={project.compensation_progress} /><Progress label="Rehabilitation & resettlement progress (aggregate)" value={project.rr_progress} /></div><div className="mt-7 flex flex-wrap gap-3"><Link to={`/citizen/map?project=${encodeURIComponent(project.public_id)}`} className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-3 text-sm font-semibold text-white"><MapPinned size={17} /> View on map</Link><Link to={`/citizen/reports?project=${encodeURIComponent(project.public_id)}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text">Report a concern</Link></div><p className="mt-6 text-xs leading-5 text-muted">Only approved public project information is displayed here. Individual compensation records, internal ML risk scores, officer notes, and other residents' personal data are not available in the citizen portal.</p></div>
    </>}
  </section>
}
