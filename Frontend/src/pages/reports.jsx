import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Reports() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const response = await api.get("/api/reports/overview");

      setD(response.data);
    } catch (error) {
      console.error("Reports loading error:", error);

      setErr(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to load report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportJson = () => {
    if (!d) return;

    const blob = new Blob(
      [JSON.stringify(d, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "bhoominetra-report.json";

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const averageRisk =
    typeof d?.average_risk === "number"
      ? `${(d.average_risk * 100).toFixed(1)}%`
      : null;

  const averageDelay =
    typeof d?.average_predicted_delay === "number"
      ? `${d.average_predicted_delay.toFixed(1)} days`
      : null;

  const cards = [
    ["Total Projects", d?.total_projects],
    ["Active Projects", d?.active_projects],
    ["High Risk", d?.high_risk],
    ["Medium Risk", d?.medium_risk],
    ["Low Risk", d?.low_risk],
    ["Average Risk", averageRisk],
    ["Avg Predicted Delay", averageDelay],
    ["Bottlenecks", d?.bottlenecks],
  ];

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
            Management Reporting
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Reports
          </h1>

          <p className="mt-2 text-sm text-muted">
            Live aggregate metrics from the backend.
          </p>
        </div>

        <div className="flex gap-2">
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

          <button
            onClick={exportJson}
            disabled={!d}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-saffron px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted">
              {key}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {d?.generated_at && (
        <p className="mt-5 text-xs text-muted">
          Generated at{" "}
          {new Date(d.generated_at).toLocaleString()}
        </p>
      )}
    </section>
  );
}