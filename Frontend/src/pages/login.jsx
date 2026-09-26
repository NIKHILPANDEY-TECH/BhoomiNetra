import {
  ChevronDown,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import logo from "../assets/bhoomi-netra-logo.jpeg"

function Login() {
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password.trim() || !role) {
      return
    }

    localStorage.removeItem("bhoomiRole")
    localStorage.removeItem("bhoomiEmail")

    localStorage.setItem("bhoomiRole", role)
    localStorage.setItem("bhoomiEmail", trimmedEmail)

    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-8">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="BhoomiNetra"
                className="h-20 w-auto object-contain sm:h-24"
              />
            </div>

            <div className="mt-5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Sign in to BhoomiNetra
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Access the land acquisition intelligence platform.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-text"
                >
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter email address"
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-text"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="text-sm font-semibold text-text"
                >
                  Select Role
                </label>

                <div className="relative mt-2">
                  <ShieldCheck
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-10 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                  >
                    <option value="" disabled>
                      Select your role
                    </option>

                    <option value="administrative">
                      Administrative
                    </option>

                    <option value="project-manager">
                      Project Manager
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={!email.trim() || !password.trim() || !role}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogIn size={17} strokeWidth={2} aria-hidden="true" />
                Sign In
              </button>
            </div>

            <div className="mt-6 border-t border-border pt-5 text-center">
              <p className="text-sm text-muted">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-saffron transition hover:text-green"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            <div className="mt-5 border-t border-border pt-5 text-center">
              <p className="text-xs leading-5 text-muted">
                Authorized access only. Account information and permissions are
                managed through the authentication system.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            © 2026 BhoomiNetra. All CODES reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login