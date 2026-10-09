import {
  Layers3,
  Map as MapIcon,
  MapPin,
  Maximize2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../lib/api"

const CENTER = [22.5, 79]

const RISK_COLORS = {
  LOW: "#2E7D32",
  MEDIUM: "#B7791F",
  HIGH: "#C66A00",
  CRITICAL: "#C0392B",
  UNSCORED: "#64748B",
}

let leafletPromise

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)

  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("bhoomi-leaflet-css")) {
      const css = document.createElement("link")

      css.id = "bhoomi-leaflet-css"
      css.rel = "stylesheet"
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"

      document.head.appendChild(css)
    }

    const existing = document.querySelector(
      'script[data-bhoomi-leaflet="true"]'
    )

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.L) {
          resolve(window.L)
        } else {
          reject(new Error("Leaflet unavailable"))
        }
      })

      existing.addEventListener("error", reject)

      return
    }

    const script = document.createElement("script")

    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.async = true
    script.dataset.bhoomiLeaflet = "true"

    script.onload = () => {
      if (window.L) {
        resolve(window.L)
      } else {
        reject(new Error("Leaflet unavailable"))
      }
    }

    script.onerror = () => {
      reject(new Error("Unable to load Leaflet"))
    }

    document.head.appendChild(script)
  })

  return leafletPromise
}


let markerClusterPromise

function loadMarkerCluster() {
  if (window.L?.markerClusterGroup) return Promise.resolve(true)
  if (markerClusterPromise) return markerClusterPromise

  markerClusterPromise = new Promise((resolve) => {
    const cssId = "bhoomi-markercluster-css"
    if (!document.getElementById(cssId)) {
      const css = document.createElement("link")
      css.id = cssId
      css.rel = "stylesheet"
      css.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
      document.head.appendChild(css)

      const themeCss = document.createElement("link")
      themeCss.id = "bhoomi-markercluster-theme-css"
      themeCss.rel = "stylesheet"
      themeCss.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
      document.head.appendChild(themeCss)
    }

    const existing = document.querySelector(
      'script[data-bhoomi-markercluster="true"]'
    )

    if (existing) {
      if (window.L?.markerClusterGroup) {
        resolve(true)
      } else {
        existing.addEventListener("load", () => resolve(Boolean(window.L?.markerClusterGroup)), { once: true })
        existing.addEventListener("error", () => resolve(false), { once: true })
      }
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
    script.async = true
    script.dataset.bhoomiMarkercluster = "true"
    script.onload = () => resolve(Boolean(window.L?.markerClusterGroup))
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return markerClusterPromise
}

function normalize(response) {
  const payload = response?.data ?? response

  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : []

  return data
    .map((x) => ({
      ...x,
      latitude: Number(x.latitude),
      longitude: Number(x.longitude),
      risk: (x.risk ?? x.risk_probability) == null ? null : Number(x.risk ?? x.risk_probability),
      risk_band: String(x.risk_band || "UNSCORED").toUpperCase(),
    }))
    .filter(
      (x) =>
        Number.isFinite(x.latitude) &&
        Number.isFinite(x.longitude)
    )
}

export default function GIS() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)

  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")

  const [showFilters, setShowFilters] = useState(false)
  const [showMarkers, setShowMarkers] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tileStatus, setTileStatus] = useState("loading")
  const [hasMore, setHasMore] = useState(false)

  // IMPORTANT:
  // This state fixes the Leaflet/data loading race condition.
  const [mapReady, setMapReady] = useState(false)

  const mapRef = useRef(null)
  const mapNode = useRef(null)
  const layerRef = useRef(null)
  const requestRef = useRef(null)
  const debounceRef = useRef(null)
  const loadSequenceRef = useRef(0)

  const role = localStorage.getItem("bhoomiRole")

  const administrative = [
    "administrative",
    "national_admin",
    "state_officer",
    "district_officer",
  ].includes(role)

  // ---------------------------------------------------------
  // LOAD ONLY PROJECTS INSIDE THE CURRENT MAP VIEWPORT
  // ---------------------------------------------------------

  const load = useCallback(async (boundsOverride = null) => {
    const map = mapRef.current
    if (!map && !boundsOverride) return

    const bounds = boundsOverride || map.getBounds()
    const params = new URLSearchParams({
      min_lat: String(Math.max(-90, bounds.getSouth())),
      max_lat: String(Math.min(90, bounds.getNorth())),
      min_lng: String(Math.max(-180, bounds.getWest())),
      max_lng: String(Math.min(180, bounds.getEast())),
      limit: "500",
    })

    // Cancel an older viewport request before starting the newer one.
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const requestSequence = ++loadSequenceRef.current

    try {
      setLoading(true)
      setError("")

      const response = await api.get(
        `/api/gis/projects?${params.toString()}`,
        { signal: controller.signal }
      )

      if (controller.signal.aborted || requestSequence !== loadSequenceRef.current) return

      const data = normalize(response)
      setItems(data)
      setHasMore(Boolean(response?.has_more))

      setSelected((current) =>
        current
          ? data.find((x) => x.project_id === current.project_id) || null
          : null
      )
    } catch (err) {
      if (err?.name === "AbortError" || controller.signal.aborted) return

      console.error("GIS loading error:", err)
      setError(
        err?.data?.detail ||
          err?.message ||
          "Failed to load GIS projects."
      )
      setItems([])
      setSelected(null)
    } finally {
      if (requestSequence === loadSequenceRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const scheduleViewportLoad = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (mapRef.current) load(mapRef.current.getBounds())
    }, 300)
  }, [load])

  // ---------------------------------------------------------
  // INITIALIZE LEAFLET, TILE STATUS, CLUSTERING AND VIEWPORT LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    if (!administrative || !mapNode.current) return

    let cancelled = false
    let mapInstance = null
    let tileLayer = null

    loadLeaflet()
      .then(async (L) => {
        if (cancelled || mapRef.current) return

        const clusteringAvailable = await loadMarkerCluster()
        if (cancelled || mapRef.current) return

        const map = L.map(mapNode.current, {
          center: CENTER,
          zoom: 5,
          zoomControl: false,
          minZoom: 4,
          maxZoom: 18,
          preferCanvas: true,
        })

        mapInstance = map
        setTileStatus("loading")

        tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
            updateWhenIdle: true,
            keepBuffer: 2,
          }
        )

        tileLayer.on("tileload", () => {
          setTileStatus("ok")
        })
        tileLayer.on("tileerror", () => {
          setTileStatus((current) => current === "ok" ? "ok" : "error")
        })
        tileLayer.addTo(map)

        const layer = clusteringAvailable
          ? L.markerClusterGroup({
              chunkedLoading: true,
              chunkInterval: 100,
              chunkDelay: 25,
              maxClusterRadius: 60,
              showCoverageOnHover: false,
              spiderfyOnMaxZoom: true,
            }).addTo(map)
          : L.layerGroup().addTo(map)

        mapRef.current = map
        layerRef.current = layer
        setMapReady(true)

        map.on("moveend", scheduleViewportLoad)

        window.setTimeout(() => {
          if (mapRef.current === map) {
            map.invalidateSize()
            load(map.getBounds())
          }
        }, 100)
      })
      .catch((err) => {
        console.error("Leaflet error:", err)
        setError(
          "Map service could not be loaded. Check internet access and refresh."
        )
      })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      requestRef.current?.abort()

      if (mapInstance) {
        mapInstance.off("moveend", scheduleViewportLoad)
        mapInstance.remove()
      } else if (mapRef.current) {
        mapRef.current.remove()
      }

      mapRef.current = null
      layerRef.current = null
      setMapReady(false)
    }
  }, [administrative, load, scheduleViewportLoad])

  // ---------------------------------------------------------
  // FILTER PROJECTS
  // ---------------------------------------------------------

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return items.filter((x) => {
      const riskOk =
        riskFilter === "ALL" ||
        x.risk_band === riskFilter

      const hay = [
        x.project_id,
        x.project_name,
        x.state,
        x.district,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return riskOk && (!q || hay.includes(q))
    })
  }, [items, search, riskFilter])

  // ---------------------------------------------------------
  // RENDER MAP MARKERS
  //
  // mapReady is deliberately included in dependencies.
  // This fixes the race between API loading and Leaflet loading.
  // ---------------------------------------------------------

  useEffect(() => {
    const L = window.L
    const map = mapRef.current
    const layer = layerRef.current

    if (!mapReady || !L || !map || !layer) {
      return
    }

    layer.clearLayers()

    if (!showMarkers) {
      return
    }

    filtered.forEach((item) => {
      const color =
        RISK_COLORS[item.risk_band] ||
        RISK_COLORS.UNSCORED

      const selectedMarker =
        selected?.project_id === item.project_id

      const size = selectedMarker ? 22 : 16
      const anchor = selectedMarker ? 11 : 8

      const icon = L.divIcon({
        className: "bhoomi-marker",

        html: `
          <span
            style="
              display:block;
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              background:${color};
              border:3px solid white;
              box-shadow:0 2px 8px rgba(15,23,42,.4);
            "
          ></span>
        `,

        iconSize: [size, size],
        iconAnchor: [anchor, anchor],
      })

      const marker = L.marker(
        [item.latitude, item.longitude],
        { icon }
      )

      marker.bindPopup(`
        <strong>${item.project_id || "Project"}</strong>
        <br/>
        Risk: ${item.risk_band}
        <br/>
        ${item.latitude.toFixed(4)},
        ${item.longitude.toFixed(4)}
      `)

      marker.on("click", () => {
        setSelected(item)

        map.setView(
          [item.latitude, item.longitude],
          Math.max(map.getZoom(), 10)
        )
      })

      marker.addTo(layer)
    })
  }, [
    filtered,
    selected,
    showMarkers,
    mapReady,
  ])

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------

  const highRisk = items.filter(
    (x) =>
      x.risk_band === "HIGH" ||
      x.risk_band === "CRITICAL"
  ).length

  const riskCoverage = items.filter(
    (x) =>
      x.risk !== null &&
      Number.isFinite(x.risk)
  ).length

  // ---------------------------------------------------------
  // ACCESS CONTROL
  // ---------------------------------------------------------

  if (!administrative) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-132px)] max-w-[1440px] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-8 text-center shadow-sm">
          <MapIcon
            size={28}
            className="mx-auto text-saffron"
          />

          <h1 className="mt-5 text-2xl font-bold text-text">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm text-muted">
            GIS project monitoring is available only
            to administrative users.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-saffron px-5 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  // ---------------------------------------------------------
  // MAP CONTROLS
  // ---------------------------------------------------------

  const zoom = (n) => {
    if (!mapRef.current) return

    mapRef.current.setZoom(
      mapRef.current.getZoom() + n
    )
  }

  const reset = () => {
    mapRef.current?.setView(CENTER, 5)
  }

  const fullscreen = () => {
    mapNode.current?.parentElement?.requestFullscreen?.()
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
            Administrative Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            GIS Map
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
PostGIS project locations with OpenStreetMap tiles. Project markers load for the visible map area as you pan and zoom.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {tileStatus === "error" && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          OpenStreetMap tiles are not loading. Check your connection or retry shortly. Project data and map tiles are separate services.
        </div>
      )}

      {/* STATS */}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Mapped Projects"
          value={items.length}
          description="Projects loaded in current map view"
        />

        <Stat
          title="High Risk Locations"
          value={highRisk}
          description="High or critical risk markers"
        />

        <Stat
          title="Visible Markers"
          value={filtered.length}
          description="Loaded projects matching filters"
        />

        <Stat
          title="Risk Coverage"
          value={`${riskCoverage}/${items.length}`}
          description="Projects with saved predictions"
        />

      </div>

      {/* MAP CARD */}

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search loaded projects or location"
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm outline-none focus:border-saffron"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">

            <button
              onClick={() =>
                setShowFilters((v) => !v)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>

            <button
              onClick={() =>
                setShowMarkers((v) => !v)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium"
            >
              <Layers3 size={17} />

              {showMarkers
                ? "Hide Markers"
                : "Show Markers"}
            </button>

            <button
              onClick={fullscreen}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium sm:col-span-1"
            >
              <Maximize2 size={17} />
              Fullscreen
            </button>

          </div>
        </div>

        {/* FILTERS */}

        {showFilters && (
          <div className="border-b border-border bg-page p-4">

            <div className="flex items-center justify-between">

              <h2 className="text-sm font-semibold">
                Map Filters
              </h2>

              <button
                onClick={() =>
                  setShowFilters(false)
                }
              >
                <X size={17} />
              </button>

            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(e.target.value)
                }
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm"
              >
                <option value="ALL">
                  All Risk Levels
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="UNSCORED">
                  Unscored
                </option>
              </select>

              <button
                onClick={() => {
                  setSearch("")
                  setRiskFilter("ALL")
                }}
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm"
              >
                Clear Filters
              </button>

            </div>
          </div>
        )}

        {/* MAP + SIDEBAR */}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* MAP */}

          <div className="relative min-h-[580px] bg-page">

            <div
              ref={mapNode}
              className="absolute inset-0 z-0"
            />

            {/* MAP TITLE */}

            <div className="absolute left-4 top-4 z-[500] rounded-lg border border-border bg-white/95 px-4 py-3 shadow">

              <div className="flex items-center gap-2">

                <MapIcon
                  size={17}
                  className="text-saffron"
                />

                <span className="text-sm font-semibold">
                  India Project Map
                </span>

              </div>

              <p className="mt-1 text-xs text-muted">
                {filtered.length} loaded project{filtered.length === 1 ? "" : "s"}
                {loading ? " · Updating…" : ""}
              </p>
              {hasMore && (
                <p className="mt-1 max-w-[220px] text-xs text-amber-700">
                  More projects exist in this area. Zoom in to load a smaller area.
                </p>
              )}

            </div>

            {/* MAP CONTROLS */}

            <div className="absolute right-4 top-4 z-[500] flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow">

              <button
                onClick={() => zoom(1)}
                className="h-10 w-10 border-b"
              >
                +
              </button>

              <button
                onClick={() => zoom(-1)}
                className="h-10 w-10 border-b"
              >
                −
              </button>

              <button
                onClick={reset}
                className="h-10 w-10 text-xs font-semibold"
              >
                IN
              </button>

            </div>

            {/* LEGEND */}

            <div className="absolute bottom-4 left-4 z-[500] rounded-lg border border-border bg-white/95 p-4 shadow">

              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Risk Legend
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">

                {Object.entries(RISK_COLORS).map(
                  ([name, color]) => (
                    <span
                      key={name}
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      <i
                        className="h-3 w-3 rounded-full border-2 border-white shadow"
                        style={{
                          backgroundColor: color,
                        }}
                      />

                      {name}
                    </span>
                  )
                )}

              </div>
            </div>
          </div>

          {/* PROJECT INFORMATION */}

          <aside className="max-h-[580px] overflow-y-auto border-t border-border bg-white lg:border-l lg:border-t-0">

            <div className="sticky top-0 z-10 border-b border-border bg-white p-5">

              <h2 className="text-lg font-bold">
                Project Information
              </h2>

              <p className="mt-1 text-sm text-muted">
                Select a marker to inspect its location
                and risk.
              </p>

            </div>

            <div className="p-5">

              {selected ? (
                <div className="rounded-lg border border-border bg-page p-4">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <Link
                        to={`/projects/${selected.project_id}`}
                        className="font-semibold hover:text-saffron"
                      >
                        {selected.project_id}
                      </Link>

                      <p className="mt-1 text-xs text-muted">
                        {selected.latitude.toFixed(5)},
                        {" "}
                        {selected.longitude.toFixed(5)}
                      </p>

                    </div>

                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          RISK_COLORS[
                            selected.risk_band
                          ] ||
                          RISK_COLORS.UNSCORED,
                      }}
                    >
                      {selected.risk_band}
                    </span>

                  </div>

                  <div className="mt-4 grid gap-3">

                    <Info label="Risk Probability">
                      {selected.risk == null
                        ? "No prediction"
                        : `${(
                            selected.risk * 100
                          ).toFixed(1)}%`}
                    </Info>

                    <Info label="Latitude">
                      {selected.latitude.toFixed(5)}
                    </Info>

                    <Info label="Longitude">
                      {selected.longitude.toFixed(5)}
                    </Info>

                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=14/${selected.latitude}/${selected.longitude}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-saffron px-4 text-sm font-semibold text-white"
                    >
                      Open in OpenStreetMap
                    </a>

                  </div>

                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-page px-4 py-10 text-center">

                  <MapPin
                    size={22}
                    className="mx-auto text-muted"
                  />

                  <p className="mt-4 text-sm font-semibold">
                    No project selected
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Click a marker on the map to view
                    project information.
                  </p>

                </div>
              )}

              {/* PROJECT LIST */}

              <div className="mt-5 space-y-3">

                {filtered
                  .slice(0, 50)
                  .map((item) => (
                    <button
                      key={item.project_id}
                      onClick={() => {
                        setSelected(item)

                        if (mapRef.current) {
                          mapRef.current.setView(
                            [
                              item.latitude,
                              item.longitude,
                            ],
                            Math.max(
                              mapRef.current.getZoom(),
                              10
                            )
                          )
                        }
                      }}
                      className={`w-full rounded-lg border p-4 text-left ${
                        selected?.project_id ===
                        item.project_id
                          ? "border-saffron bg-orange-50/50"
                          : "border-border hover:border-saffron"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        <span className="font-semibold">
                          {item.project_id}
                        </span>

                        <span
                          className="rounded-full px-2 py-1 text-[11px] font-semibold text-white"
                          style={{
                            backgroundColor:
                              RISK_COLORS[
                                item.risk_band
                              ] ||
                              RISK_COLORS.UNSCORED,
                          }}
                        >
                          {item.risk_band}
                        </span>

                      </div>

                      <p className="mt-2 text-xs text-muted">
                        {item.latitude.toFixed(4)},
                        {" "}
                        {item.longitude.toFixed(4)}
                      </p>

                    </button>
                  ))}

              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Stat({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-muted">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-text">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted">
        {description}
      </p>

    </div>
  )
}

function Info({ label, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">

      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-text">
        {children}
      </p>

    </div>
  )
}