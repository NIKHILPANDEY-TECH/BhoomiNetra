import {
  ChevronDown,
  CircleHelp,
  FileText,
  Search,
  Send,
  Upload,
  X
} from "lucide-react"
import { useState } from "react"

function Help() {
  const [selectedFile, setSelectedFile] = useState(null)

  const role = localStorage.getItem("bhoomiRole")
  const isProjectManager = role === "project-manager"

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <CircleHelp
            size={24}
            strokeWidth={2}
            className="shrink-0 text-saffron"
            aria-hidden="true"
          />

          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Help
          </h1>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
          {isProjectManager
            ? "Find guidance for your assigned projects, review common topics, or submit a support query."
            : "Find guidance, review common topics, or submit a support query to the BhoomiNETRA team."}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search
            size={18}
            strokeWidth={2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />

          <input
            type="text"
            placeholder="Search help topics"
            className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-4 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-text">
            Common Help Topics
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted">
            Frequently used areas of the BhoomiNetra platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <FileText
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />

            <h3 className="mt-4 text-base font-bold text-text">
              {isProjectManager ? "My Projects" : "Projects"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {isProjectManager
                ? "Learn how to view assigned projects, open project details, and manage project documents."
                : "Learn how to view projects, open project details, and manage project documents."}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <CircleHelp
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />

            <h3 className="mt-4 text-base font-bold text-text">
              Risk Analysis
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Understand project risk, delay probability, and contributing
              factors.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <Upload
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />

            <h3 className="mt-4 text-base font-bold text-text">
              Document Upload
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Get guidance on uploading project documents and What-If change
              documents.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <Search
              size={21}
              strokeWidth={2}
              className="text-saffron"
              aria-hidden="true"
            />

            <h3 className="mt-4 text-base font-bold text-text">
              Search & Filters
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Learn how to locate projects and refine information using
              filters.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Send
            size={21}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-saffron"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-bold text-text">
              Submit a Query
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Submit a support request or report an issue.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="queryType"
              className="text-sm font-semibold text-text"
            >
              Query Type
            </label>

            <div className="relative mt-2">
              <select
                id="queryType"
                defaultValue=""
                className="h-11 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-9 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
              >
                <option value="" disabled>
                  Select query type
                </option>

                <option value="technical">Technical Issue</option>
                <option value="project">Project Related</option>
                <option value="prediction">Prediction Related</option>
                <option value="account">Account Related</option>
                <option value="other">Other</option>
              </select>

              <ChevronDown
                size={16}
                strokeWidth={2}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="text-sm font-semibold text-text"
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              placeholder="Enter query subject"
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-text"
            >
              Description
            </label>

            <textarea
              id="description"
              rows="6"
              placeholder="Describe your query or issue"
              className="mt-2 w-full resize-none rounded-lg border border-border bg-white px-3 py-3 text-sm leading-6 text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="helpAttachment"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-page px-4 py-7 text-center transition hover:border-saffron hover:bg-white sm:flex-row"
            >
              <Upload
                size={19}
                strokeWidth={2}
                className="text-saffron"
                aria-hidden="true"
              />

              <span className="text-sm font-semibold text-saffron">
                Attach supporting document
              </span>

              <input
                id="helpAttachment"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-page p-4">
                <FileText
                  size={19}
                  strokeWidth={2}
                  className="shrink-0 text-saffron"
                  aria-hidden="true"
                />

                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                  {selectedFile.name}
                </p>

                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove attachment"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-text"
                >
                  <X size={17} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-stretch border-t border-border pt-5 sm:justify-end">
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] sm:w-auto"
          >
            <Send size={17} strokeWidth={2} aria-hidden="true" />
            Submit Query
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">
              Previous Queries
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Review queries submitted from your account.
            </p>
          </div>

          <span className="shrink-0 text-sm font-medium text-muted">
            — Queries
          </span>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-page px-5 py-10 text-center">
          <CircleHelp
            size={22}
            strokeWidth={2}
            className="mx-auto text-muted"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-semibold text-text">
            No previous queries available
          </p>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Submitted support queries will appear here when the support system
            is connected.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Help