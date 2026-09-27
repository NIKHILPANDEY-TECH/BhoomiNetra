import { Bell, ChevronDown, LogOut, Search, Settings, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import ImageCarousel from "./components/ImageCarousel"
import logo from "./assets/bhoomi-netra-logo.jpeg"
import { api, clearSession } from "./lib/api"

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [risk, setRisk] = useState([])
  const [error, setError] = useState("")
  const role = localStorage.getItem("bhoomiBackendRole")
  useEffect(() => {
    Promise.all([api.get("/api/dashboard/summary"), api.get("/api/dashboard/risk-distribution")])
      .then(([s, r]) => { setSummary(s.data); setRisk(r.data || []) })
      .catch((e) => setError(e.message))
  }, [])
  const high = risk.find((x) => x.risk_band === "HIGH")?.count || 0
  const medium = risk.find((x) => x.risk_band === "MEDIUM")?.count || 0
  return (
    <main className="min-h-[calc(100vh-132px)] bg-page">
      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <ImageCarousel />
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text sm:text-4xl">Welcome to BhoomiNetra</h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-muted">AI-powered land acquisition monitoring, risk prediction and decision support.</p>
        </div>
        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [role === "NATIONAL_ADMIN" ? "Total Projects" : "My Projects", summary?.total_projects ?? "—", "Projects visible to your role"],
            ["High Risk Projects", high || 0, "Latest model risk band"],
            ["Active Projects", summary?.active_projects ?? "—", "Currently active acquisitions"]
          ].map(([title, value, sub]) => <div key={title} className="rounded-lg border border-border bg-white p-6 text-center shadow-sm"><p className="text-lg font-bold text-text">{title}</p><p className="mt-4 text-4xl font-bold text-saffron">{value}</p><p className="mt-2 text-xs text-muted">{sub}</p></div>)}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-text">Risk Distribution</h2><div className="mt-5 grid grid-cols-3 gap-3">{[["HIGH",high], ["MEDIUM",medium], ["LOW",risk.find((x)=>x.risk_band==="LOW")?.count||0]].map(([b,c])=><div key={b} className="rounded-lg bg-page p-4 text-center"><p className="text-xs font-semibold text-muted">{b}</p><p className="mt-2 text-2xl font-bold text-text">{c}</p></div>)}</div></div>
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-text">Quick Actions</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><Link className="rounded-lg bg-saffron px-4 py-3 text-center text-sm font-semibold text-white" to="/projects">Open Projects</Link><Link className="rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold text-text" to="/reports">View Reports</Link><Link className="rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold text-text" to="/risk-analysis">Risk Analysis</Link><Link className="rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold text-text" to="/alerts">Alerts</Link></div></div>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [morePosition, setMorePosition] = useState({ top: 0, left: 0 })
  const moreRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const backendRole = localStorage.getItem("bhoomiBackendRole") || "PROJECT_OFFICER"
  const isAdmin = backendRole === "NATIONAL_ADMIN"
  const user = (() => { try { return JSON.parse(localStorage.getItem("bhoomiUser") || "{}") } catch { return {} } })()
  const moreItems = isAdmin ? ["/high-risk","/risk-analysis","/stage-prediction","/recommendations","/what-if","/analytics","/reports","/audit-logs"].map((path)=>({path,label:path.slice(1).replaceAll("-"," ").replace(/\b\w/g,(c)=>c.toUpperCase())})) : ["/risk-analysis","/stage-prediction","/recommendations","/what-if","/reports"].map((path)=>({path,label:path.slice(1).replaceAll("-"," ").replace(/\b\w/g,(c)=>c.toUpperCase())}))
  const logout = async () => { try { await api.post("/api/auth/logout", {}) } catch (_) {} clearSession(); navigate("/login", { replace: true }) }
  return <div className="min-h-screen bg-white text-text">
    <header className="border-b border-border bg-white"><div className="mx-auto flex min-h-24 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10"><Link to="/dashboard" className="shrink-0"><img src={logo} alt="BhoomiNetra" className="h-20 w-auto object-contain sm:h-[88px]" /></Link><div className="hidden flex-1 justify-center md:flex"><div className="relative w-full max-w-md"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"/><input className="h-11 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm outline-none focus:border-saffron" placeholder="Search project" onKeyDown={(e)=>{if(e.key==="Enter"&&e.currentTarget.value.trim()) navigate(`/projects?search=${encodeURIComponent(e.currentTarget.value.trim())}`)}} /></div></div><div className="ml-auto flex items-center gap-3 sm:gap-5"><Link to="/alerts" className="flex items-center gap-2 text-sm font-medium"><Bell size={18}/><span className="hidden sm:inline">Notifications</span></Link><Link to="/settings" className="flex items-center gap-2 text-sm font-medium"><Settings size={18}/><span className="hidden sm:inline">Settings</span></Link><button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-600"><LogOut size={18}/><span className="hidden sm:inline">Logout</span></button><span className="flex h-8 w-8 items-center justify-center rounded-full border border-border"><User size={18}/></span></div></div></header>
    <nav className="relative z-40 border-b border-border bg-white"><div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 sm:px-6 lg:px-10"><NavLink to="/dashboard" active={location.pathname==="/dashboard"}>Dashboard</NavLink><NavLink to="/projects" active={location.pathname.startsWith("/projects")}>{isAdmin?"Projects":"My Projects"}</NavLink>{isAdmin&&<NavLink to="/gis" active={location.pathname==="/gis"}>GIS</NavLink>}<div className="relative shrink-0"><button ref={moreRef} onClick={()=>{const r=moreRef.current?.getBoundingClientRect();if(r)setMorePosition({top:r.bottom+2,left:r.left});setMoreOpen(v=>!v)}} className="flex items-center gap-1 border-b-2 border-transparent py-4 text-sm font-medium">More<ChevronDown size={16} className={moreOpen?"rotate-180":""}/></button></div><NavLink to="/help" active={location.pathname==="/help"}>Help</NavLink></div></nav>
    {moreOpen&&createPortal(<div className="fixed z-[9999] w-56 rounded-lg border border-border bg-white py-2 shadow-xl" style={{top:morePosition.top,left:morePosition.left}}>{moreItems.map(i=><Link key={i.path} to={i.path} onClick={()=>setMoreOpen(false)} className="block px-4 py-2.5 text-sm capitalize hover:bg-page hover:text-green">{i.label}</Link>)}</div>,document.body)}
    {location.pathname==="/dashboard"?<Dashboard/>:<main className="min-h-[calc(100vh-132px)] bg-page"><Outlet/></main>}
    <footer className="bg-green py-5 text-center text-sm text-white">© 2026 BhoomiNetra. All rights reserved.</footer>
  </div>
}
function NavLink({to,active,children}){return <Link to={to} className={`shrink-0 border-b-2 py-4 text-sm font-semibold ${active?"border-saffron text-saffron":"border-transparent text-text hover:text-green"}`}>{children}</Link>}
