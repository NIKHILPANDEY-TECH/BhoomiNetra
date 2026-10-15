import { ArrowLeft, ArrowRight, MapPin, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "../../lib/api"

export default function CitizenProjects() {
  const [params, setParams] = useSearchParams()
  const queryString = params.toString()
  const [search, setSearch] = useState(params.get("search") || "")
  const [projects, setProjects] = useState([])
  const [page, setPage] = useState(Number(params.get("page") || 1))
  const [limit, setLimit] = useState(25)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = new URLSearchParams(queryString)
    setSearch(current.get("search") || "")
    setPage(Math.max(1, Number(current.get("page") || 1)))
  }, [queryString])

  useEffect(() => {
    const controller = new AbortController()
    const current = new URLSearchParams(queryString)
    const query = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (current.get("search")) query.set("search", current.get("search"))
    setLoading(true)
    setError("")
    api.get(`/api/citizen/projects?${query}`, { signal: controller.signal })
      .then((response) => {
        setProjects(Array.isArray(response?.data) ? response.data : [])
        setTotal(Number(response?.total || 0))
        setTotalPages(Number(response?.total_pages || 0))
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        setError(err?.message || "Unable to load local projects.")
        setProjects([]); setTotal(0); setTotalPages(0)
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, limit, queryString])

  const applySearch = (event) => {
    event.preventDefault()
    const next = {}
    if (search.trim()) next.search = search.trim()
    next.page = "1"
    setParams(next)
    setPage(1)
  }

  const rangeStart = total ? (page - 1) * limit + 1 : 0
  const rangeEnd = Math.min(page * limit, total)

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-green"><ArrowLeft size={16} /> Citizen dashboard</Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Your district</p><h1 className="mt-2 text-3xl font-bold text-text">Local projects</h1><p className="mt-2 text-sm text-muted">Browse published projects in your assigned area. Internal risk scores and private records are not shown.</p></div><Link to="/citizen/map" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white"><MapPin size={17} /> View map</Link></div>

      {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={applySearch} className="mt-6 flex gap-3 rounded-xl border border-border bg-white p-4 shadow-sm"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project name or public ID" className="h-11 w-full rounded-lg border border-border pl-10 pr-3 text-sm outline-none focus:border-green" /></div><button className="h-11 rounded-lg bg-green px-5 text-sm font-semibold text-white">Search</button></form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted"><span>{total.toLocaleString()} published project{total === 1 ? "" : "s"} available in your area</span><label className="flex items-center gap-2">Per page<select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1) }} className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label></div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {loading ? <p className="p-10 text-center text-sm text-muted">Loading local projects…</p> : projects.length === 0 ? <div className="p-10 text-center"><MapPin size={28} className="mx-auto text-muted" /><p className="mt-3 font-semibold text-text">No matching public projects</p><p className="mt-1 text-sm text-muted">Try another project name or public ID.</p></div> : <div className="divide-y divide-border">
          {projects.map((project) => <article key={project.public_id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text">{project.project_name}</h2><span className="rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold text-muted">{project.status}</span></div><p className="mt-1 text-xs text-muted">{project.public_id} · {project.district}, {project.state}</p><p className="mt-2 text-sm text-muted">{project.project_type} · Current stage: {project.current_stage}</p><p className="mt-1 text-xs text-muted">Planned completion: {project.planned_completion_date || "Not published"}</p></div><div className="flex flex-wrap gap-2"><Link to={`/citizen/projects/${encodeURIComponent(project.public_id)}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-green hover:text-green">Project update <ArrowRight size={15} /></Link><Link to={`/citizen/map?project=${encodeURIComponent(project.public_id)}`} className="inline-flex items-center gap-2 rounded-lg bg-page px-3 py-2 text-sm font-semibold text-text hover:bg-green/10">Map <MapPin size={15} /></Link></div></article>)}
        </div>}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()}</p><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => { const next = page - 1; setPage(next); const nextParams = new URLSearchParams(); if (params.get("search")) nextParams.set("search", params.get("search")); nextParams.set("page", String(next)); setParams(nextParams) }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-40"><ArrowLeft size={15} /> Previous</button><span className="flex h-10 items-center px-2 text-sm text-muted">Page {page} of {Math.max(1, totalPages)}</span><button disabled={page >= totalPages || loading} onClick={() => { const next = page + 1; setPage(next); const nextParams = new URLSearchParams(); if (params.get("search")) nextParams.set("search", params.get("search")); nextParams.set("page", String(next)); setParams(nextParams) }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-40">Next <ArrowRight size={15} /></button></div></div>
    </section>
  )
}
