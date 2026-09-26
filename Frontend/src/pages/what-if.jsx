import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileText,
  RotateCcw,
  Search,
  ShieldAlert,
  Upload,
  X
} from "lucide-react"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

function WhatIf() {
  const [searchParams] = useSearchParams()
  const initialProject = searchParams.get("project") || ""

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  const [projectSearch, setProjectSearch] = useState(initialProject)
  const [selectedProject, setSelectedProject] = useState(initialProject)
  const [selectedFile, setSelectedFile] = useState(null)
  const [changesUnlocked, setChangesUnlocked] = useState(false)

  const [formData, setFormData] = useState({
    projectType: "",
    landArea: "",
    affectedFamilies: "",
    compensationStatus: "",
    approvalStatus: "",
    legalStatus: "",
    possessionStatus: "",
    rehabilitationStatus: "",
    stakeholderResponsiveness: ""
  })

  const selectProject = () => {
    const value = projectSearch.trim()

    if (!value) {
      setSelectedProject("")
      setSelectedFile(null)
      setChangesUnlocked(false)
      return
    }

    setSelectedProject(value)
    setSelectedFile(null)
    setChangesUnlocked(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      setChangesUnlocked(false)
      return
    }

    if (file.type !== "application/pdf") {
      event.target.value = ""
      setSelectedFile(null)
      setChangesUnlocked(false)
      return
    }

    setSelectedFile(file)
    setChangesUnlocked(true)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setChangesUnlocked(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value
    }))
  }

  const resetScenario = () => {
    setFormData({
      projectType: "",
      landArea: "",
      affectedFamilies: "",
      compensationStatus: "",
      approvalStatus: "",
      legalStatus: "",
      possessionStatus: "",
      rehabilitationStatus: "",
      stakeholderResponsiveness: ""
    })
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6">
        <Link
          to={selectedProject ? `/projects/${selectedProject}` : "/projects"}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
        >
          <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
          Back to {isProjectManager ? "My Project Details" : "Project Details"}
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron sm:text-sm">
            {isProjectManager
              ? "My Project Intelligence"
              : "Administrative Project Intelligence"}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            What-If Analysis
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Select a project, upload the latest change document, and modify
            project conditions to simulate a different scenario.
          </p>
        </div>

        <div className="text-sm text-muted">
          Selected Project:{" "}
          <span className="break-all font-medium text-text">
            {selectedProject || "None"}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Search
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              1. Select Project
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Search for the project you want to simulate.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder={
                isProjectManager
                  ? "Search my project name or project ID"
                  : "Search project name or project ID"
              }
              className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <button
            type="button"
            onClick={selectProject}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21]"
          >
            <Search size={17} strokeWidth={2} aria-hidden="true" />
            Select Project
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-page px-4 py-3 text-sm leading-6 text-muted">
          {isProjectManager
            ? "Live search results for assigned projects will appear here when project data is connected."
            : "Live project search results will appear here when project data is connected."}
        </div>

        {selectedProject && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-page px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Selected Project
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-text">
                {selectedProject}
              </p>
            </div>

            <CheckCircle2
              size={20}
              strokeWidth={2}
              className="shrink-0 text-green"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div
        className={`mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6 ${
          !selectedProject ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <Upload
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              2. Upload Change Document
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Upload the written document containing the latest project
              changes.
            </p>
          </div>
        </div>

        {!selectedProject ? (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
            <p className="text-sm font-semibold text-text">
              Select a project first
            </p>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
              The change document can be uploaded after a project is selected.
            </p>
          </div>
        ) : (
          <>
            <label
              htmlFor="what-if-pdf"
              className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center transition hover:border-saffron hover:bg-white"
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
                Upload project change PDF
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Upload the document describing the changes made to the project.
              </p>

              <span className="mt-4 text-sm font-semibold text-saffron">
                Choose PDF
              </span>

              <input
                id="what-if-pdf"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-page p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
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
                    Change document selected
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-text"
                  aria-label="Remove change document"
                >
                  <X size={17} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6 ${
          !changesUnlocked ? "opacity-60" : ""
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <FileText
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                3. Modify Project Details
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Update the project conditions for the scenario you want to
                simulate.
              </p>
            </div>
          </div>

          {!changesUnlocked && (
            <span className="text-xs font-medium text-muted sm:text-right">
              Upload the change PDF first
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-x-5 gap-y-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="projectType"
              className="text-sm font-semibold text-text"
            >
              Project Type
            </label>

            <input
              id="projectType"
              name="projectType"
              type="text"
              value={formData.projectType}
              onChange={handleChange}
              disabled={!changesUnlocked}
              placeholder="Enter changed project type"
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            />
          </div>

          <div>
            <label
              htmlFor="landArea"
              className="text-sm font-semibold text-text"
            >
              Land Area
            </label>

            <input
              id="landArea"
              name="landArea"
              type="text"
              value={formData.landArea}
              onChange={handleChange}
              disabled={!changesUnlocked}
              placeholder="Enter changed land area"
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            />
          </div>

          <div>
            <label
              htmlFor="affectedFamilies"
              className="text-sm font-semibold text-text"
            >
              Affected Families
            </label>

            <input
              id="affectedFamilies"
              name="affectedFamilies"
              type="text"
              value={formData.affectedFamilies}
              onChange={handleChange}
              disabled={!changesUnlocked}
              placeholder="Enter changed number"
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            />
          </div>

          <div>
            <label
              htmlFor="compensationStatus"
              className="text-sm font-semibold text-text"
            >
              Compensation Status
            </label>

            <select
              id="compensationStatus"
              name="compensationStatus"
              value={formData.compensationStatus}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed status</option>
              <option value="improved">Improved</option>
              <option value="partially-completed">Partially Completed</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="approvalStatus"
              className="text-sm font-semibold text-text"
            >
              Approval Status
            </label>

            <select
              id="approvalStatus"
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="legalStatus"
              className="text-sm font-semibold text-text"
            >
              Legal Status
            </label>

            <select
              id="legalStatus"
              name="legalStatus"
              value={formData.legalStatus}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed status</option>
              <option value="no-dispute">No Dispute</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="possessionStatus"
              className="text-sm font-semibold text-text"
            >
              Possession Status
            </label>

            <select
              id="possessionStatus"
              name="possessionStatus"
              value={formData.possessionStatus}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rehabilitationStatus"
              className="text-sm font-semibold text-text"
            >
              Rehabilitation & Resettlement
            </label>

            <select
              id="rehabilitationStatus"
              name="rehabilitationStatus"
              value={formData.rehabilitationStatus}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="stakeholderResponsiveness"
              className="text-sm font-semibold text-text"
            >
              Stakeholder Responsiveness
            </label>

            <select
              id="stakeholderResponsiveness"
              name="stakeholderResponsiveness"
              value={formData.stakeholderResponsiveness}
              onChange={handleChange}
              disabled={!changesUnlocked}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20 disabled:cursor-not-allowed disabled:bg-page"
            >
              <option value="">Select changed responsiveness</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetScenario}
            disabled={!changesUnlocked}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-text transition hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
            Reset Changes
          </button>

          <button
            type="button"
            disabled={!changesUnlocked}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BarChart3 size={17} strokeWidth={2} aria-hidden="true" />
            Apply Scenario Changes
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              4. Scenario Impact
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Compare the project outcome after the selected changes.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Current Risk
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Scenario Risk
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Current Delay
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>

          <div className="rounded-lg border border-border bg-page p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Scenario Delay
            </p>

            <p className="mt-3 min-h-8 text-2xl font-bold text-text">—</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
            <AlertTriangle
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-text">
            Scenario result unavailable
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            Risk and delay impact will be calculated when the project data and
            prediction model are connected.
          </p>
        </div>
      </div>
    </section>
  )
}

export default WhatIf