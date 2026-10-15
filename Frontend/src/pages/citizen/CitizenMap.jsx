import { AlertTriangle, MapPin, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../../lib/api"

const MAP_CENTER = [24.0717, 75.0695]
let leafletPromise

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("citizen-leaflet-css")) {
      const css = document.createElement("link")
      css.id = "citizen-leaflet-css"
      css.rel = "stylesheet"
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(css)
    }
    const scriptExisting = document.querySelector('script[data-citizen-leaflet="true"]')
    if (scriptExisting) {
      if (window.L) return resolve(window.L)
      scriptExisting.addEventListener("load", () => window.L ? resolve(window.L) : reject(new Error("Leaflet unavailable")), { once: true })
      scriptExisting.addEventListener("error", () => reject(new Error("Unable to load Leaflet")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.async = true
    script.dataset.citizenLeaflet = "true"
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet unavailable"))
    script.onerror = () => reject(new Error("Unable to load Leaflet"))
    document.head.appendChild(script)
  })
  return leafletPromise
}

export default function CitizenMap() {
  const mapNode = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const timerRef = useRef(null)
  const requestRef = useRef(null)
  const sequenceRef = useRef(0)
  const [searchParams] = useSearchParams()
  const selectedProject = searchParams.get("project")
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tileError, setTileError] = useState(false)
  const [count, setCount] = useState(0)

  const loadViewport = useCallback(async () => {
    const map = mapRef.current
    if (!map) return
    const bounds = map.getBounds()
    const query = new URLSearchParams({
      min_lat: String(Math.max(-90, bounds.getSouth())),
      max_lat: String(Math.min(90, bounds.getNorth())),
      min_lng: String(Math.max(-180, bounds.getWest())),
      max_lng: String(Math.min(180, bounds.getEast())),
      limit: "500",
    })
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const sequence = ++sequenceRef.current
    setLoading(true); setError("")
    try {
      const response = await api.get(`/api/citizen/map?${query}`, { signal: controller.signal })
      if (controller.signal.aborted || sequence !== sequenceRef.current) return
      const L = window.L
      layerRef.current?.clearLayers()
      const projects = Array.isArray(response?.data) ? response.data : []
      projects.forEach((project) => {
        if (!Number.isFinite(Number(project.latitude)) || !Number.isFinite(Number(project.longitude))) return
        const marker = L.marker([Number(project.latitude), Number(project.longitude)])
        const popup = document.createElement("div")
        const title = document.createElement("strong")
        title.textContent = project.project_name || project.project_id
        const meta = document.createElement("p")
        meta.textContent = `${project.district}, ${project.state} · ${project.current_stage}`
        meta.style.margin = "6px 0"
        const link = document.createElement("a")
        link.href = `/citizen/projects/${encodeURIComponent(project.project_id)}`
        link.textContent = "View public project update"
        link.addEventListener("click", (event) => { event.preventDefault(); navigate(link.getAttribute("href")) })
        popup.append(title, meta, link)
        marker.bindPopup(popup)
        marker.addTo(layerRef.current)
      })
      setCount(projects.length)
    } catch (err) {
      if (err?.name === "AbortError" || controller.signal.aborted) return
      setError(err?.message || "Unable to load map projects.")
    } finally {
      if (sequence === sequenceRef.current) setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((L) => {
      if (cancelled || !mapNode.current || mapRef.current) return
      const map = L.map(mapNode.current, { center: MAP_CENTER, zoom: 8, minZoom: 4, maxZoom: 18, zoomControl: true })
      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      })
      tiles.on("tileerror", () => setTileError(true))
      tiles.on("tileload", () => setTileError(false))
      tiles.addTo(map)
      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)
      const schedule = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => loadViewport(), 300)
      }
      map.on("moveend", schedule)
      setReady(true)
      setTimeout(() => { map.invalidateSize(); loadViewport() }, 80)
    }).catch((err) => setError(err?.message || "Map service could not be loaded."))

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
      requestRef.current?.abort()
      if (mapRef.current) mapRef.current.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [loadViewport])

  useEffect(() => {
    if (!ready || !selectedProject) return
    const controller = new AbortController()
    api.get(`/api/citizen/projects/${encodeURIComponent(selectedProject)}`, { signal: controller.signal })
      .then((response) => {
        const project = response?.data
        if (!project || !Number.isFinite(Number(project.latitude)) || !Number.isFinite(Number(project.longitude))) {
          setError("This project has no published map location.")
          return
        }
        mapRef.current?.setView([Number(project.latitude), Number(project.longitude)], 13, { animate: true })
      })
      .catch((err) => { if (err?.name !== "AbortError") setError(err?.message || "Unable to locate that project.") })
    return () => controller.abort()
  }, [ready, selectedProject])

  const refresh = () => loadViewport()

  return <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Area map</p><h1 className="mt-2 text-3xl font-bold text-text">Projects on the map</h1><p className="mt-2 text-sm text-muted">Only published projects inside your assigned district are returned by the backend.</p></div><div className="flex flex-wrap gap-2"><Link to="/citizen/projects" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold"><MapPin size={16} /> Project list</Link><button onClick={refresh} disabled={!ready || loading} className="inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button></div></div>
    {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle size={17} className="mt-0.5 shrink-0" />{error}</div>}
    {tileError && <div role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Some OpenStreetMap tiles failed to load. Check your connection or refresh the map. Project data is served separately from map tiles.</div>}
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-white shadow-sm"><div ref={mapNode} className="h-[62vh] min-h-[360px] w-full" /><div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted"><span>{loading ? "Loading projects…" : `${count} project markers in this view`}</span><span>Map tiles © OpenStreetMap contributors</span></div></div>
    <p className="mt-3 text-xs leading-5 text-muted">If no markers appear, check that your assigned district has published projects with valid coordinates. This map does not expose internal risk scores or private records.</p>
  </section>
}
