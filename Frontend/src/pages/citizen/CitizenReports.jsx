import { FileText, RefreshCw, Send } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api } from "../../lib/api"

const CATEGORIES = [
  ["PROJECT_UPDATE", "Project information update"],
  ["SITE_CONCERN", "Site or project concern"],
  ["ACCESS_OR_SAFETY", "Access or safety concern"],
  ["REHABILITATION_QUERY", "Rehabilitation / resettlement query"],
  ["OTHER", "Other"],
]

export default function CitizenReports() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [reports, setReports] = useState([])
  const [projectId, setProjectId] = useState(searchParams.get("project") || "")
  const [category, setCategory] = useState("PROJECT_UPDATE")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const load = async () => {
    setLoading(true); setError("")
    try {
      const [projectResponse, reportResponse] = await Promise.all([
        api.get("/api/citizen/projects?page=1&limit=100"),
        api.get("/api/citizen/reports?page=1&limit=100"),
      ])
      const availableProjects = Array.isArray(projectResponse?.data) ? [...projectResponse.data] : []
      const requestedProject = searchParams.get("project")
      if (requestedProject && !availableProjects.some((project) => project.public_id === requestedProject)) {
        try {
          const selectedResponse = await api.get(`/api/citizen/projects/${encodeURIComponent(requestedProject)}`)
          if (selectedResponse?.data) availableProjects.unshift(selectedResponse.data)
        } catch {
          // Keep the rest of the reports page usable if a URL project is no longer public.
        }
      }
      setProjects(availableProjects)
      setReports(Array.isArray(reportResponse?.data) ? reportResponse.data : [])
    } catch (err) {
      setError(err?.message || "Unable to load reports.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const initialProject = searchParams.get("project")
    if (initialProject) setProjectId(initialProject)
  }, [searchParams])

  const submit = async (event) => {
    event.preventDefault()
    setError(""); setNotice("")
    if (!projectId) { setError("Select a project in your area."); return }
    if (description.trim().length < 10) { setError("Please describe your concern in at least 10 characters."); return }
    setSubmitting(true)
    try {
      await api.post("/api/citizen/reports", { project_id: projectId, category, description: description.trim() })
      setDescription("")
      setNotice("Your report was submitted. You can track it below.")
      await load()
    } catch (err) {
      setError(err?.message || "Unable to submit your report.")
    } finally {
      setSubmitting(false)
    }
  }

  const statusClass = (status) => status === "RESOLVED" ? "bg-green/10 text-green" : status === "IN_REVIEW" ? "bg-amber-50 text-amber-800" : "bg-page text-muted"

  return <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Citizen support</p><h1 className="mt-2 text-3xl font-bold text-text">Report a local concern</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Submit a concern related to a published project in your assigned district. Only you can view your submitted reports in this portal.</p></div>
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="mt-5 rounded-xl border border-green/20 bg-green/5 px-4 py-3 text-sm text-green">{notice}</div>}

    <form onSubmit={submit} className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-text">New report</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-text">Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal" required><option value="">Select a published local project</option>{projects.map((project) => <option key={project.public_id} value={project.public_id}>{project.public_id} — {project.project_name}</option>)}</select></label><label className="text-sm font-semibold text-text">Concern category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal">{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-semibold text-text sm:col-span-2">Describe the concern<textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={2000} rows={5} placeholder="Share the project-related concern. Do not include bank details, identity numbers, or another person's private information." className="mt-2 w-full rounded-lg border border-border px-3 py-3 text-sm font-normal outline-none focus:border-green" required /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">{description.length}/2000 characters. Reports start as Submitted.</p><button disabled={submitting || loading || projects.length === 0} className="inline-flex h-11 items-center gap-2 rounded-lg bg-green px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> {submitting ? "Submitting…" : "Submit report"}</button></div></form>

    <section className="mt-8 rounded-xl border border-border bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-border p-5"><div><h2 className="text-lg font-bold text-text">Your reports</h2><p className="mt-1 text-sm text-muted">Only reports submitted from your account appear here.</p></div><button onClick={load} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold disabled:opacity-50"><RefreshCw size={15} /> Refresh</button></div>{loading ? <p className="p-6 text-sm text-muted">Loading reports…</p> : reports.length === 0 ? <div className="p-8 text-center"><FileText className="mx-auto text-muted" size={27} /><p className="mt-3 font-semibold text-text">No reports submitted yet</p><p className="mt-1 text-sm text-muted">Your submitted reports will appear here.</p></div> : <div className="divide-y divide-border">{reports.map((report) => <article key={report.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-text">{report.project_name}</p><p className="mt-1 text-xs text-muted">{report.project_id} · {CATEGORIES.find(([value]) => value === report.category)?.[1] || report.category}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(report.status)}`}>{report.status.replaceAll("_", " ")}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{report.description}</p><p className="mt-3 text-xs text-muted">Submitted {report.created_at ? new Date(report.created_at).toLocaleString() : "date unavailable"}</p></article>)}</div>}</section>
  </section>
}
