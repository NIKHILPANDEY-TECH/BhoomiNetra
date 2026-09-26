import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  UserPlus
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/bhoomi-netra-logo.jpeg"

function Signup() {
  const navigate = useNavigate()

  const [role, setRole] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [aadhaarVerificationRequested, setAadhaarVerificationRequested] =
    useState(false)

  const handleRoleChange = (event) => {
    setRole(event.target.value)
    setOtpSent(false)
    setOtp("")
    setOtpVerified(false)
    setAadhaarNumber("")
    setAadhaarVerificationRequested(false)
  }

  const handleSendOtp = () => {
    if (!document.getElementById("officialEmail")?.value.trim()) {
      return
    }

    setOtpSent(true)
  }

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setOtpVerified(true)
    }
  }

  const handleAadhaarVerification = () => {
    if (aadhaarNumber.length === 12) {
      setAadhaarVerificationRequested(true)
    }
  }

  const handleSignup = () => {
    if (role === "administrative" && otpVerified) {
      navigate("/login")
      return
    }

    if (
      role === "project-manager" &&
      aadhaarVerificationRequested
    ) {
      navigate("/login")
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-xl">
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
                Create your account
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Register through your authorized identity verification method.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="role"
                  className="text-sm font-semibold text-text"
                >
                  Account Type
                </label>

                <div className="relative mt-2">
                  <BriefcaseBusiness
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <select
                    id="role"
                    value={role}
                    onChange={handleRoleChange}
                    className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-10 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                  >
                    <option value="" disabled>
                      Select account type
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

              {!role && (
                <div className="rounded-lg border border-border bg-page px-4 py-5 text-center">
                  <ShieldCheck
                    size={22}
                    strokeWidth={2}
                    className="mx-auto text-saffron"
                    aria-hidden="true"
                  />

                  <p className="mt-3 text-sm font-semibold text-text">
                    Select an account type
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    The verification process will depend on the account type
                    you select.
                  </p>
                </div>
              )}

              {role === "administrative" && (
                <>
                  <div>
                    <label
                      htmlFor="adminFullName"
                      className="text-sm font-semibold text-text"
                    >
                      Full Name
                    </label>

                    <div className="relative mt-2">
                      <User
                        size={18}
                        strokeWidth={2}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="adminFullName"
                        type="text"
                        placeholder="Enter full name"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="ministryName"
                      className="text-sm font-semibold text-text"
                    >
                      Ministry Name
                    </label>

                    <div className="relative mt-2">
                      <BriefcaseBusiness
                        size={18}
                        strokeWidth={2}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="ministryName"
                        type="text"
                        placeholder="Enter official ministry name"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="officialEmail"
                      className="text-sm font-semibold text-text"
                    >
                      Official Ministry Email
                    </label>

                    <div className="relative mt-2">
                      <Mail
                        size={18}
                        strokeWidth={2}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="officialEmail"
                        type="email"
                        placeholder="Enter official ministry email"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="adminPassword"
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
                        id="adminPassword"
                        type="password"
                        placeholder="Create password"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-page p-4">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={19}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-saffron"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-sm font-semibold text-text">
                          Ministry Email Verification
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted">
                          A one-time password will be sent to the official
                          ministry email.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text transition hover:border-saffron hover:text-saffron"
                    >
                      <Mail size={16} strokeWidth={2} aria-hidden="true" />
                      {otpSent ? "OTP Sent" : "Send OTP"}
                    </button>
                  </div>

                  {otpSent && (
                    <div>
                      <label
                        htmlFor="otp"
                        className="text-sm font-semibold text-text"
                      >
                        Enter OTP
                      </label>

                      <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength="6"
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Enter 6-digit OTP"
                          className="h-11 min-w-0 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 6}
                          className="h-11 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>

                      {otpVerified && (
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-green">
                          <CheckCircle2
                            size={17}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          OTP verified
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={!otpVerified}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserPlus
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Complete Registration
                  </button>
                </>
              )}

              {role === "project-manager" && (
                <>
                  <div>
                    <label
                      htmlFor="pmFullName"
                      className="text-sm font-semibold text-text"
                    >
                      Full Name
                    </label>

                    <div className="relative mt-2">
                      <User
                        size={18}
                        strokeWidth={2}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="pmFullName"
                        type="text"
                        placeholder="Enter full name"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pmEmail"
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
                        id="pmEmail"
                        type="email"
                        placeholder="Enter email address"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pmPassword"
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
                        id="pmPassword"
                        type="password"
                        placeholder="Create password"
                        className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-page p-4">
                    <div className="flex items-start gap-3">
                      <FileCheck2
                        size={19}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-saffron"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-sm font-semibold text-text">
                          Identity Verification
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted">
                          Project Manager registration requires identity
                          verification through an authorized Aadhaar
                          verification service.
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="aadhaarNumber"
                      className="mt-4 block text-sm font-semibold text-text"
                    >
                      Aadhaar Number
                    </label>

                    <input
                      id="aadhaarNumber"
                      type="password"
                      inputMode="numeric"
                      maxLength="12"
                      value={aadhaarNumber}
                      onChange={(event) =>
                        setAadhaarNumber(
                          event.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Enter 12-digit Aadhaar number"
                      className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                    />

                    <button
                      type="button"
                      onClick={handleAadhaarVerification}
                      disabled={aadhaarNumber.length !== 12}
                      className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text transition hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShieldCheck
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Verify Identity
                    </button>

                    {aadhaarVerificationRequested && (
                      <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted">
                        <CheckCircle2
                          size={17}
                          strokeWidth={2}
                          className="mt-1 shrink-0 text-green"
                          aria-hidden="true"
                        />

                        <span>
                          Verification request is ready for the authorized
                          verification service.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-page p-4">
                    <p className="text-xs leading-5 text-muted">
                      Actual identity verification must be completed through
                      the authorized verification service. This frontend does
                      not independently verify Aadhaar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={!aadhaarVerificationRequested}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-semibold text-white transition hover:bg-[#e88a21] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserPlus
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Complete Registration
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-green"
              >
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                Back to Sign In
              </Link>

              <Link
                to="/login"
                className="text-sm font-semibold text-saffron transition hover:text-green"
              >
                Already have an account?
              </Link>
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

export default Signup