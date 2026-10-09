import { Plus, RefreshCw, Search, Eye, BrainCircuit, X, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api } from "../lib/api"

const blank = {project_name:"",state:"Madhya Pradesh",district:"Bhopal",project_type:"Highway",land_area:0,affected_families:0,pending_approvals:0,legal_disputes:0,compensation_pending:0,compensation_progress:0,rr_progress:0,current_stage:"Land Identification",stage_index:0,days_current_stage:0,historical_stage_avg_days:30,historical_delay_rate:0.2,planned_duration_days:365,observed_elapsed_days:0,stage_overrun_ratio:0,project_start_date:new Date().toISOString().slice(0,10),planned_completion_date:new Date(Date.now()+31536000000).toISOString().slice(0,10),latitude:23.2599,longitude:77.4126}
const initialFilters = (params) => ({
  search: params.get("search") || "",
  state: params.get("state") || "",
  district: params.get("district") || "",
  current_stage: params.get("current_stage") || "",
  status: params.get("status") || "",
  risk_band: params.get("risk_band") || "",
  sort_by: params.get("sort_by") || "created_at",
  sort_order: params.get("sort_order") || "desc",
  limit: params.get("limit") || "50",
})

function riskLabel(project) {
  if (project.risk_probability == null) return "Not scored"
  return `${(Number(project.risk_probability) * 100).toFixed(1)}% · ${project.risk_band || "UNSCORED"}`
}

export default function Projects(){
  const [params,setParams]=useSearchParams()
  const queryString=params.toString()
  const [projects,setProjects]=useState([])
  const [total,setTotal]=useState(0)
  const [totalPages,setTotalPages]=useState(0)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState(blank)
  const [saving,setSaving]=useState(false)
  const [refreshTick,setRefreshTick]=useState(0)
  const [filters,setFilters]=useState(()=>initialFilters(params))
  const page=Math.max(1,Number(params.get("page")||1))
  const pageSize=Math.max(1,Number(params.get("limit")||50))
  const backendRole=localStorage.getItem("bhoomiBackendRole")
  const canCreate=["NATIONAL_ADMIN","STATE_ADMIN","PROJECT_DATA_OPERATOR"].includes(backendRole)

  useEffect(()=>{
    setFilters(initialFilters(new URLSearchParams(queryString)))
  },[queryString])

  useEffect(()=>{
    const controller=new AbortController()
    const query=new URLSearchParams(queryString)
    if(!query.has("page")) query.set("page","1")
    if(!query.has("limit")) query.set("limit","50")
    setLoading(true)
    setError("")
    api.get(`/api/projects?${query.toString()}`,{signal:controller.signal})
      .then(response=>{
        const payload=response?.data
        setProjects(Array.isArray(payload)?payload:Array.isArray(response?.items)?response.items:[])
        setTotal(Number(response?.total||0))
        setTotalPages(Number(response?.total_pages||0))
      })
      .catch(err=>{
        if(err?.name==="AbortError") return
        setError(err?.data?.detail||err?.message||"Unable to load projects.")
        setProjects([]);setTotal(0);setTotalPages(0)
      })
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return ()=>controller.abort()
  },[queryString,refreshTick])

  const updateFilter=(key,value)=>setFilters(current=>({...current,[key]:value}))
  const applyFilters=()=>{
    const next={}
    Object.entries(filters).forEach(([key,value])=>{if(String(value).trim())next[key]=String(value).trim()})
    next.page="1"
    setParams(next)
  }
  const goToPage=(nextPage)=>{
    const next=Object.fromEntries(params.entries())
    next.page=String(Math.min(Math.max(1,nextPage),Math.max(1,totalPages)))
    setParams(next)
  }
  const resetFilters=()=>{
    const clean={limit:filters.limit||"50",sort_by:"created_at",sort_order:"desc",page:"1"}
    setFilters(initialFilters(new URLSearchParams(clean)))
    setParams(clean)
  }

  const create=async(e)=>{
    e.preventDefault();setSaving(true);setError("")
    try{
      const r=await api.post("/api/projects",{...form,land_area:Number(form.land_area),affected_families:Number(form.affected_families),pending_approvals:Number(form.pending_approvals),legal_disputes:Number(form.legal_disputes),compensation_pending:Number(form.compensation_pending),compensation_progress:Number(form.compensation_progress),rr_progress:Number(form.rr_progress),stage_index:Number(form.stage_index),days_current_stage:Number(form.days_current_stage),historical_stage_avg_days:Number(form.historical_stage_avg_days),historical_delay_rate:Number(form.historical_delay_rate),planned_duration_days:Number(form.planned_duration_days),observed_elapsed_days:Number(form.observed_elapsed_days),stage_overrun_ratio:Number(form.stage_overrun_ratio),latitude:Number(form.latitude),longitude:Number(form.longitude)})
      setModal(false);setForm(blank);window.location.href=`/projects/${r.public_id}`
    }catch(err){setError(err?.data?.detail||err.message)}finally{setSaving(false)}
  }

  const rangeLabel=useMemo(()=>total===0?"Showing 0 projects":`Showing ${Math.min((page-1)*pageSize+1,total)}–${Math.min(page*pageSize,total)} of ${total.toLocaleString()} projects`,[page,pageSize,total])

  return <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-saffron">Project Intelligence</p><h1 className="mt-2 text-3xl font-bold text-text sm:text-4xl">{backendRole==="NATIONAL_ADMIN"?"Projects":"My Projects"}</h1><p className="mt-2 text-sm text-muted">Search and browse every project using server-side pagination. The map loads geographic data separately for smooth navigation.</p></div>{canCreate&&<button onClick={()=>setModal(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white"><Plus size={17}/> New Project</button>}</div>
    {error&&<div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

    <div className="mt-6 rounded-lg border border-border bg-white p-4 shadow-sm">
      <form onSubmit={e=>{e.preventDefault();applyFilters()}}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold text-muted md:col-span-2">Search project name or ID<div className="relative mt-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input value={filters.search} onChange={e=>updateFilter("search",e.target.value)} placeholder="e.g. LA-02048 or highway expansion" className="h-11 w-full rounded-lg border border-border pl-10 pr-3 text-sm font-normal text-text outline-none focus:border-saffron"/></div></label>
          <label className="text-xs font-semibold text-muted">State<input value={filters.state} onChange={e=>updateFilter("state",e.target.value)} placeholder="Any state" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm font-normal text-text outline-none focus:border-saffron"/></label>
          <label className="text-xs font-semibold text-muted">District<input value={filters.district} onChange={e=>updateFilter("district",e.target.value)} placeholder="Any district" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm font-normal text-text outline-none focus:border-saffron"/></label>
          <label className="text-xs font-semibold text-muted">Acquisition stage<input value={filters.current_stage} onChange={e=>updateFilter("current_stage",e.target.value)} placeholder="Any stage" className="mt-1 h-11 w-full rounded-lg border border-border px-3 text-sm font-normal text-text outline-none focus:border-saffron"/></label>
          <label className="text-xs font-semibold text-muted">Status<select value={filters.status} onChange={e=>updateFilter("status",e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-text"><option value="">All statuses</option>{["DRAFT","SUBMITTED","APPROVED","ACTIVE","COMPLETED","ARCHIVED"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-xs font-semibold text-muted">Risk level<select value={filters.risk_band} onChange={e=>updateFilter("risk_band",e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-text"><option value="">All risk levels</option>{["LOW","MEDIUM","HIGH","CRITICAL","UNSCORED"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-xs font-semibold text-muted">Sort by<select value={filters.sort_by} onChange={e=>updateFilter("sort_by",e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-text">{[["created_at","Recently added"],["project_name","Project name"],["state","State"],["district","District"],["status","Status"],["current_stage","Acquisition stage"],["risk_probability","Risk score"],["predicted_delay_days","Predicted delay"]].map(([v,label])=><option value={v} key={v}>{label}</option>)}</select></label>
          <label className="text-xs font-semibold text-muted">Order<select value={filters.sort_order} onChange={e=>updateFilter("sort_order",e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-text"><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2"><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-saffron px-4 text-sm font-semibold text-white"><Search size={16}/> Apply filters</button><button type="button" onClick={resetFilters} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold">Reset</button><button type="button" onClick={()=>setRefreshTick(x=>x+1)} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm disabled:opacity-50"><RefreshCw size={15} className={loading?"animate-spin":""}/> Refresh</button><div className="ml-auto flex items-center gap-2 text-sm text-muted"><span>Rows per page</span><select value={filters.limit} onChange={e=>{const value=e.target.value;updateFilter("limit",value);const next=Object.fromEntries(params.entries());next.limit=value;next.page="1";setParams(next)}} className="h-10 rounded-lg border border-border bg-white px-2 text-sm text-text"><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></div></div>
      </form>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted" aria-live="polite">{rangeLabel}</p><p className="text-xs text-muted">Map markers are loaded separately by viewport; all projects remain searchable here.</p></div>
    <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white shadow-sm"><table className="min-w-[1120px] w-full"><thead className="bg-page"><tr>{["Project","Location","Stage","Status","ML risk","Predicted delay","Actions"].map(x=><th key={x} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">{x}</th>)}</tr></thead><tbody>
      {loading?<tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-muted">Loading projects…</td></tr>:projects.length===0?<tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-muted">No projects match these filters.</td></tr>:projects.map(p=><tr key={p.id} className="border-t border-border hover:bg-page"><td className="px-5 py-4"><Link to={`/projects/${p.public_id}`} className="font-semibold text-text hover:text-saffron">{p.project_name}</Link><p className="mt-1 text-xs text-muted">{p.public_id}</p></td><td className="px-5 py-4 text-sm">{p.district}, {p.state}</td><td className="px-5 py-4 text-sm">{p.current_stage}</td><td className="px-5 py-4"><span className="rounded-full bg-page px-3 py-1 text-xs font-semibold">{p.status}</span></td><td className="px-5 py-4 text-sm"><span className="font-semibold">{riskLabel(p)}</span></td><td className="px-5 py-4 text-sm">{p.predicted_delay_days==null?"—":`${Math.round(Number(p.predicted_delay_days))} days`}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Link to={`/projects/${p.public_id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"><Eye size={15}/> View</Link><Link to={`/gis?project=${encodeURIComponent(p.public_id)}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-saffron hover:text-saffron"><MapPin size={15}/> View on Map</Link><Link to={`/risk-analysis?project=${p.public_id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-all duration-200 hover:border-saffron hover:bg-orange-50 hover:text-[#a94f00] hover:shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-saffron"><BrainCircuit size={15}/> Check ML</Link></div></td></tr>)}</tbody></table></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3"><p className="text-sm text-muted">Page {Math.min(page,Math.max(totalPages,1))} of {Math.max(totalPages,1)}</p><div className="flex gap-2"><button onClick={()=>goToPage(page-1)} disabled={page<=1||loading} className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16}/> Previous</button><button onClick={()=>goToPage(page+1)} disabled={page>=totalPages||loading||totalPages===0} className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={16}/></button></div></div>

    {modal&&<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-4"><form onSubmit={create} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Create Project</h2><p className="mt-1 text-sm text-muted">Create a project record that can immediately be scored by ML.</p></div><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(blank).map(([key,val])=><label key={key} className="text-xs font-semibold uppercase tracking-wide text-muted">{key.replaceAll("_"," ")}<input type={key.includes("date")?"date":typeof val==="number"?"number":"text"} step={key.includes("rate")||key.includes("ratio")?"0.01":"any"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm font-normal normal-case text-text outline-none focus:border-saffron"/></label>)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setModal(false)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-white">{saving?"Creating…":"Create Project"}</button></div></form></div>}
  </section>
}
