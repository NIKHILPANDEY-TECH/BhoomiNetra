import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import logo from "../assets/logo.png";
import { login, loginDemo } from "../lib/api";

const DEMO_ROLES = [
  {
    value: "national_admin",
    label: "National Admin",
  },
  {
    value: "state_officer",
    label: "State Officer",
  },
  {
    value: "district_officer",
    label: "District Officer",
  },
  {
    value: "project_officer",
    label: "Project Officer",
  },
  {
    value: "data_operator",
    label: "Data Operator",
  },
];

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [demoRole, setDemoRole] = useState("national_admin");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login({
        email: form.email,
        password: form.password,
      });

      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token);
      }

      if (response?.token) {
        localStorage.setItem("access_token", response.token);
      }

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";

      setError(
        typeof message === "string"
          ? message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError("");

      const response = await loginDemo(demoRole);

      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token);
      }

      if (response?.token) {
        localStorage.setItem("access_token", response.token);
      }

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Demo login failed.";

      setError(
        typeof message === "string" ? message : "Demo login failed."
      );
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/70 to-blue-100/80" />
      </div>

      {/* Decorative glass shapes */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl -z-10" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_25px_80px_rgba(30,64,175,0.14)] p-7 sm:p-9">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white/75 border border-white/80 shadow-lg flex items-center justify-center p-3 mb-4">
              <img
                src={logo}
                alt="BhoomiNetra"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Welcome to BhoomiNetra
            </h1>

            <p className="text-sm text-slate-500 mt-1 text-center">
              Land Acquisition Intelligence Platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/80 bg-white/70 py-3.5 pl-11 pr-4 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/80 bg-white/70 py-3.5 pl-11 pr-12 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-slate-900/10"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              DEMO ACCESS
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Demo Login */}
          <div className="space-y-3">
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/80 bg-white/70 py-3.5 pl-11 pr-4 text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                {DEMO_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed text-blue-700 py-3.5 font-semibold flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck size={18} />

              {demoLoading ? "Signing in..." : "Continue with Demo"}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-7">
            <p className="text-xs text-slate-400">
              Authorized access only • BhoomiNetra
            </p>

            <Link
              to="/"
              className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}