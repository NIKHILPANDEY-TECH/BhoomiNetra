import { ExternalLink, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function GIS() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const response = await api.get(
        "/api/gis/projects?min_lat=8&max_lat=37&min_lng=68&max_lng=98"
      );

      setItems(response.data || []);
    } catch (error) {
      console.error("GIS loading error:", error);
      setErr(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to load GIS projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const coordinateGroups = useMemo(() => {
    return new Set(
      items.map((x) =>
        x.latitude !== undefined && x.latitude !== null
          ? `${Math.round(Number(x.latitude) * 10) / 10}`
          : ""
      )
    ).size;
  }, [items]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
            Spatial Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold">GIS Map</h1>

          <p className="mt-2 text-sm text-muted">
            Live project coordinates from PostGIS. Open individual points in
            OpenStreetMap.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat t="Mapped Projects" v={items.length} />

        <Stat
          t="High Risk"
          v={items.filter((x) => x.risk_band === "HIGH").length}
        />

        <Stat
          t="Coordinate Groups"
          v={coordinateGroups}
        />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white shadow-sm">
        <div className="grid min-h-[520px] lg:grid-cols-[1fr_380px]">
          <div className="relative overflow-hidden bg-[#eaf1f5] p-6">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(#cbd5e1 1px,transparent 1px),linear-gradient(90deg,#cbd5e1 1px,transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            <div className="relative flex h-full min-h-[470px] items-center justify-center">
              <div className="rounded-2xl border border-border bg-white/90 p-8 text-center shadow-sm">
                <MapPin
                  className="mx-auto text-saffron"
                  size={32}
                />

                <p className="mt-3 font-bold">
                  PostGIS Project Layer
                </p>

                <p className="mt-1 max-w-sm text-sm text-muted">
                  {items.length} projects returned for the India viewport.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {items.slice(0, 30).map((x, i) => {
                    const latitude = Number(x.latitude);
                    const longitude = Number(x.longitude);

                    if (
                      !Number.isFinite(latitude) ||
                      !Number.isFinite(longitude)
                    ) {
                      return null;
                    }

                    return (
                      <a
                        key={x.project_id || i}
                        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-3 w-3 rounded-full border-2 border-white bg-saffron shadow"
                        title={`${x.project_id || "Project"} ${
                          x.risk_band || ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto border-t border-border lg:border-l lg:border-t-0">
            {items.length ? (
              items.map((x, i) => {
                const latitude = Number(x.latitude);
                const longitude = Number(x.longitude);

                return (
                  <div
                    key={x.project_id || i}
                    className="border-b border-border p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/projects/${x.project_id}`}
                          className="font-semibold hover:text-saffron"
                        >
                          {x.project_id}
                        </Link>

                        <p className="mt-1 text-xs text-muted">
                          {Number.isFinite(latitude)
                            ? latitude.toFixed(4)
                            : "—"}
                          ,{" "}
                          {Number.isFinite(longitude)
                            ? longitude.toFixed(4)
                            : "—"}
                        </p>
                      </div>

                      <span className="rounded-full bg-page px-2.5 py-1 text-xs font-semibold">
                        {x.risk_band || "UNSCORED"}
                      </span>
                    </div>

                    {Number.isFinite(latitude) &&
                      Number.isFinite(longitude) && (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron"
                        >
                          Open map
                          <ExternalLink size={14} />
                        </a>
                      )}
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-sm text-muted">
                {loading
                  ? "Loading projects..."
                  : "No projects with coordinates."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ t, v }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-sm text-muted">{t}</p>
      <p className="mt-2 text-2xl font-bold">{v}</p>
    </div>
  );
}