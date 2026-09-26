import {
  FileText,
  Filter,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  X
} from "lucide-react"
import { useState } from "react"

function Projects() {
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const role = localStorage.getItem("bhoomiRole")
  const isAdministrative = role === "administrative"
  const isProjectManager = role === "project-manager"

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.type !== "application/pdf") {
      event.target.value = ""
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const closeNewProject = () => {
    setNewProjectOpen(false)
    setSelectedFile(null)
  }

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                {isProjectManager ? "My Projects" : "Projects"}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
                {isProjectManager
                  ? "View and monitor your assigned land acquisition projects."
                  : "View and monitor land acquisition projects across India."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
                <MapPin size={17} strokeWidth={2} aria-hidden="true" />
                <span>
                  {isProjectManager ? "Assigned Projects" : "All India"}
                </span>
              </div>

              {isAdministrative && (
                <button
                  type="button"
                  onClick={() => setNewProjectOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21]"
                >
                  <Plus size={18} strokeWidth={2} aria-hidden="true" />
                  New Project
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-medium text-muted">
              {isProjectManager ? "My Projects" : "Total Projects"}
            </p>

            <div className="mt-3 min-h-8 text-2xl font-bold text-text">—</div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-medium text-muted">Active Projects</p>

            <div className="mt-3 min-h-8 text-2xl font-bold text-text">—</div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-medium text-muted">High Risk</p>

            <div className="mt-3 min-h-8 text-2xl font-bold text-text">—</div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-medium text-muted">Delayed</p>

            <div className="mt-3 min-h-8 text-2xl font-bold text-text">—</div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_170px_auto]">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="text"
                placeholder={
                  isProjectManager
                    ? "Search my project name or project ID"
                    : "Search project name or project ID"
                }
                className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              />
            </div>

            <select
              defaultValue=""
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                State
              </option>

              <option value="all">All States</option>
            </select>

            <select
              defaultValue=""
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                Project Type
              </option>

              <option value="all">All Types</option>
            </select>

            <select
              defaultValue=""
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            >
              <option value="" disabled>
                Risk Level
              </option>

              <option value="all">All Risk Levels</option>
            </select>

            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron"
            >
              <SlidersHorizontal
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
              Filters
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted sm:items-center">
            <Filter
              size={14}
              strokeWidth={2}
              className="mt-0.5 shrink-0 sm:mt-0"
              aria-hidden="true"
            />

            <span>
              {isProjectManager
                ? "Filters will use assigned project data when connected."
                : "Filters will use live project data when connected."}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-text">
                {isProjectManager ? "My Projects" : "All Projects"}
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                {isProjectManager
                  ? "Select an assigned project to view its complete acquisition profile."
                  : "Select a project to view its complete acquisition profile."}
              </p>
            </div>

            <span className="shrink-0 text-sm font-medium text-muted">
              — Projects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px]">
              <thead className="border-b border-border bg-page">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Project
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Project Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Progress
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Risk
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-page">
                        <Search
                          size={20}
                          strokeWidth={2}
                          className="text-muted"
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-text">
                        No project data available
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted">
                        {isProjectManager
                          ? "Assigned project records will appear here when the project data source is connected."
                          : "Project records will appear here when the project data source is connected."}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {newProjectOpen && isAdministrative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 sm:py-8">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-text">
                  Add New Project
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Upload the project details document in PDF format.
                </p>
              </div>

              <button
                type="button"
                onClick={closeNewProject}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-page hover:text-text"
              >
                <X size={19} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7">
              <label
                htmlFor="project-pdf"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center transition hover:border-saffron hover:bg-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
                  <Upload
                    size={21}
                    strokeWidth={2}
                    className="text-saffron"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-4 text-base font-semibold text-text">
                  Upload project details PDF
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Select a PDF containing the project information.
                </p>

                <span className="mt-4 text-sm font-semibold text-saffron">
                  Choose PDF
                </span>

                <input
                  id="project-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-white p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-page">
                    <FileText
                      size={19}
                      strokeWidth={2}
                      className="text-saffron"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      PDF document selected
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-page hover:text-text"
                    aria-label="Remove selected PDF"
                  >
                    <X size={17} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeNewProject}
                className="h-11 rounded-lg border border-border px-5 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedFile}
                className="h-11 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition enabled:hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Projects