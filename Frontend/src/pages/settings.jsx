import {
  Bell,
  Check,
  ChevronDown,
  ImagePlus,
  Lock,
  LogOut,
  Save,
  Settings as SettingsIcon,
  User,
  X
} from "lucide-react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function Settings() {
  const navigate = useNavigate()

  const [profilePhoto, setProfilePhoto] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  const role = localStorage.getItem("bhoomiRole")
  const email = localStorage.getItem("bhoomiEmail") || "—"

  const isAdministrative = role === "administrative"

  const roleLabel = isAdministrative
    ? "Administrative"
    : role === "project-manager"
      ? "Project Manager"
      : "—"

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = ""
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setProfilePhoto(imageUrl)
  }

  const removePhoto = () => {
    setProfilePhoto(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  const handleLogout = () => {
    localStorage.removeItem("bhoomiRole")
    localStorage.removeItem("bhoomiEmail")
    navigate("/login", { replace: true })
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <SettingsIcon
              size={24}
              strokeWidth={2}
              className="shrink-0 text-saffron"
              aria-hidden="true"
            />

            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Settings
            </h1>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Manage your profile photo and view account information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text transition hover:border-red-500 hover:text-red-600"
        >
          <LogOut size={17} strokeWidth={2} aria-hidden="true" />
          Logout
        </button>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <User
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                Profile
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Profile details are assigned during login. Only the profile
                photo can be changed here.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-border bg-page">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    size={46}
                    strokeWidth={1.6}
                    className="text-muted"
                    aria-hidden="true"
                  />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-saffron transition hover:text-green"
                >
                  <ImagePlus
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Change Photo
                </button>

                {profilePhoto && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-red-600"
                  >
                    <X size={15} strokeWidth={2} aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-text"
                >
                  Full Name
                </label>

                <div className="relative mt-2">
                  <input
                    id="fullName"
                    type="text"
                    value="—"
                    disabled
                    readOnly
                    className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                  />

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="text-sm font-semibold text-text"
                >
                  Role
                </label>

                <div className="relative mt-2">
                  <select
                    id="role"
                    value={roleLabel}
                    disabled
                    className="h-11 w-full appearance-none rounded-lg border border-border bg-page px-3 pr-16 text-sm text-muted outline-none"
                  >
                    <option value={roleLabel}>
                      {roleLabel}
                    </option>
                  </select>

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

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
                  htmlFor="email"
                  className="text-sm font-semibold text-text"
                >
                  Email Address
                </label>

                <div className="relative mt-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                  />

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-text"
                >
                  Contact Number
                </label>

                <div className="relative mt-2">
                  <input
                    id="phone"
                    type="tel"
                    value="—"
                    disabled
                    readOnly
                    className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                  />

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="text-sm font-semibold text-text"
                >
                  Department
                </label>

                <div className="relative mt-2">
                  <input
                    id="department"
                    type="text"
                    value="—"
                    disabled
                    readOnly
                    className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                  />

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="text-sm font-semibold text-text"
                >
                  Designation
                </label>

                <div className="relative mt-2">
                  <input
                    id="designation"
                    type="text"
                    value="—"
                    disabled
                    readOnly
                    className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                  />

                  <Lock
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <Lock
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                Account Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                These values are assigned by the authentication system.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="userId"
                className="text-sm font-semibold text-text"
              >
                User ID
              </label>

              <div className="relative mt-2">
                <input
                  id="userId"
                  type="text"
                  value="—"
                  disabled
                  readOnly
                  className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                />

                <Lock
                  size={15}
                  strokeWidth={2}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="accessLevel"
                className="text-sm font-semibold text-text"
              >
                Access Level
              </label>

              <div className="relative mt-2">
                <input
                  id="accessLevel"
                  type="text"
                  value="—"
                  disabled
                  readOnly
                  className="h-11 w-full rounded-lg border border-border bg-page px-3 pr-10 text-sm text-muted outline-none"
                />

                <Lock
                  size={15}
                  strokeWidth={2}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <Bell
              size={21}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-saffron"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-text">
                Notifications
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Notification preferences for your account.
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-border rounded-lg border border-border">
            <div className="flex items-start justify-between gap-5 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  High-Risk Alerts
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Receive alerts when projects move into high or critical risk.
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-5 w-5 shrink-0 accent-[#FF9933]"
              />
            </div>

            <div className="flex items-start justify-between gap-5 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  Delay Alerts
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Receive notifications about predicted or recorded project
                  delays.
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-5 w-5 shrink-0 accent-[#FF9933]"
              />
            </div>

            <div className="flex items-start justify-between gap-5 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  Recommendation Alerts
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Receive notifications when new recommendations are generated.
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-5 w-5 shrink-0 accent-[#FF9933]"
              />
            </div>

            <div className="flex items-start justify-between gap-5 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  System Notifications
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Receive important system and platform notifications.
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-5 w-5 shrink-0 accent-[#FF9933]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-green">
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              Changes saved
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21]"
          >
            <Save size={17} strokeWidth={2} aria-hidden="true" />
            Save Changes
          </button>
        </div>
      </div>
    </section>
  )
}

export default Settings
