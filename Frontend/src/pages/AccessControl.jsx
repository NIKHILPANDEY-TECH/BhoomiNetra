import { useEffect, useMemo, useState } from "react";
import { api, API_BASE, getToken } from "../lib/api";

const GROUPS = {
  "Project operations": ["PROJECT_READ", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PROJECT_APPROVE", "PROJECT_REJECT", "PROJECT_ARCHIVE", "PROJECT_RESTORE", "PROJECT_ASSIGN"],
  "AI and decision support": ["PREDICTION_RUN", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "RECOMMENDATION_APPROVE", "INTERVENTION_CREATE", "INTERVENTION_UPDATE"],
  "Reports and analytics": ["REPORT_VIEW", "REPORT_EXPORT"],
  "User and access administration": ["USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DISABLE", "ROLE_MANAGE", "PERMISSION_MANAGE"],
  "Governance and platform": ["AUDIT_VIEW", "MODEL_VIEW", "MODEL_MANAGE", "DATA_IMPORT", "DATA_APPROVE", "SECURITY_VIEW"],
  "Citizen services": ["CITIZEN_PROJECT_READ", "CITIZEN_REPORT_CREATE", "CITIZEN_REPORT_VIEW"],
};

const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const button = "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";

export default function AccessControl() {
  const [data, setData] = useState({ permissions: [], roles: [], users: [] });
  const [selectedRole, setSelectedRole] = useState("");
  const [draft, setDraft] = useState([]);
  const [identity, setIdentity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [identityType, setIdentityType] = useState("OFFICIAL_EMPLOYEE_ID");
  const [identityFile, setIdentityFile] = useState(null);
  const [directory, setDirectory] = useState({ roles: [], jurisdictions: [], organizations: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [newUser, setNewUser] = useState({ username: "", full_name: "", email: "", phone: "", designation: "", department: "", role: "DISTRICT_OFFICER", state_id: "", district_id: "", division_id: "", organization_id: "", password: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [access, submissions, options] = await Promise.all([
        api.get("/api/admin/access-control"),
        api.get("/api/admin/identity"),
        api.get("/api/admin/user-directory-options"),
      ]);
      setData(access.data);
      setIdentity(submissions.data || []);
      setDirectory(options.data || { roles: [], jurisdictions: [], organizations: [] });
      const activeRole = access.data.roles.find((r) => r.id === selectedRole)
        || access.data.roles.find((r) => r.name !== "NATIONAL_ADMIN")
        || access.data.roles[0];
      if (activeRole) {
        setSelectedRole(activeRole.id);
        setDraft(activeRole.permissions);
      }
    } catch (e) {
      setError(e.message || "Could not load access-control data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const role = useMemo(() => data.roles.find((r) => r.id === selectedRole), [data.roles, selectedRole]);

  const selectRole = (id) => {
    setSelectedRole(id);
    setDraft(data.roles.find((r) => r.id === id)?.permissions || []);
    setMessage("");
  };

  const togglePermission = (name) => {
    setDraft((current) => current.includes(name) ? current.filter((p) => p !== name) : [...current, name]);
  };

  const savePermissions = async () => {
    if (!role) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.put(`/api/admin/roles/${role.id}/permissions`, { permissions: draft });
      setMessage(`Permissions saved for ${role.name}.`);
      await load();
      setDraft([...draft]);
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  const toggleUser = async (user) => {
    if (!window.confirm(`${user.is_active ? "Disable" : "Enable"} ${user.username}?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.patch(`/api/admin/users/${user.id}/status`, { is_active: !user.is_active });
      setMessage(`Account status updated for ${user.username}.`);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const createOfficial = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = { ...newUser };
      ["state_id", "district_id", "division_id", "organization_id"].forEach((key) => { if (!payload[key]) payload[key] = null; });
      await api.post("/api/admin/users", payload);
      setMessage(`Official account created for ${newUser.full_name}. Share the temporary credentials securely.`);
      setNewUser({ username: "", full_name: "", email: "", phone: "", designation: "", department: "", role: "DISTRICT_OFFICER", state_id: "", district_id: "", division_id: "", organization_id: "", password: "" });
      setShowCreate(false);
      await load();
    } catch (e) { setError(e.message || "Could not create official account."); }
    finally { setBusy(false); }
  };

  const editOfficial = async (person) => {
    const role = window.prompt(`Assign role to ${person.username}:\n${directory.roles.map((r) => r.name).filter((name) => name !== "NATIONAL_ADMIN").join(", ")}`, person.role);
    if (role === null) return;
    const normalizedRole = role.trim().toUpperCase();
    if (!directory.roles.some((r) => r.name === normalizedRole) || normalizedRole === "NATIONAL_ADMIN") {
      setError("Choose a valid non-National-Admin role."); return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      await api.patch(`/api/admin/users/${person.id}`, { role: normalizedRole });
      setMessage(`Role updated for ${person.username}.`); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const resetOfficialPassword = async (person) => {
    const password = window.prompt(`Enter a new temporary password for ${person.username} (minimum 12 characters):`);
    if (password === null) return;
    if (password.length < 12) { setError("Temporary password must contain at least 12 characters."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await api.post(`/api/admin/users/${person.id}/reset-password`, { temporary_password: password });
      setMessage(`Temporary password reset for ${person.username}. Share it through a secure channel.`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const submitIdentity = async (event) => {
    event.preventDefault();
    if (!identityFile) { setError("Choose a PDF, JPEG or PNG file first."); return; }
    const form = new FormData();
    form.append("document_type", identityType);
    form.append("file", identityFile);
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/identity/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || result.message || "Identity upload failed.");
      setIdentityFile(null);
      setMessage("Identity document submitted securely for review.");
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const reviewIdentity = async (item, status) => {
    const note = window.prompt(`Optional review note for ${item.filename}:`, "") || "";
    setBusy(true); setError("");
    try {
      await api.patch(`/api/admin/identity/${item.id}/review`, { status, review_note: note });
      setMessage(`Identity submission marked ${status.toLowerCase()}.`);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const downloadDocument = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/identity/${item.id}/document`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Document download was denied.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = item.filename || "identity-document";
      anchor.click(); URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="mx-auto max-w-7xl p-8 text-slate-600">Loading access-control workspace…</div>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">National administration</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Access & Security Management</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Control feature access by role, manage account status and review optional identity verification. Backend permissions remain authoritative; hiding a menu item is not a security boundary.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold text-slate-900">Role permission matrix</h2><p className="mt-1 text-sm text-slate-500">Select a role and enable only the operations it needs.</p></div>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={selectedRole} onChange={(e) => selectRole(e.target.value)}>
            {data.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {role?.name === "NATIONAL_ADMIN" && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">The National Admin role is protected from permission removal to prevent administrator lockout.</p>}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {Object.entries(GROUPS).map(([group, names]) => (
            <div key={group} className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">{group}</h3>
              <div className="space-y-2">
                {names.filter((name) => data.permissions.includes(name)).map((name) => (
                  <label key={name} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">{name.replaceAll("_", " ")}</span>
                    <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={draft.includes(name)} disabled={role?.name === "NATIONAL_ADMIN"} onChange={() => togglePermission(name)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end"><button className={button} disabled={busy || !role || role.name === "NATIONAL_ADMIN"} onClick={savePermissions}>Save role permissions</button></div>
      </section>

      <section className={panel}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-bold text-slate-900">Official user management</h2><p className="mt-1 text-sm text-slate-500">Create real staff accounts, assign roles and jurisdictions, and manage their access.</p></div>
          <button type="button" className={button} onClick={() => setShowCreate((value) => !value)}>{showCreate ? "Close form" : "+ Add official"}</button>
        </div>
        {showCreate && <form onSubmit={createOfficial} className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
          <h3 className="font-semibold text-slate-900">Create an official account</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">The account will be able to sign in through the regular official login using its username/email and temporary password. Demo login is unchanged.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[["full_name","Full name","text",true],["username","Username","text",true],["email","Official email","email",false],["phone","Mobile number","tel",false],["designation","Designation","text",false],["department","Department","text",false],["password","Temporary password (12+ characters)","password",true]].map(([key,label,type,required]) => <label key={key} className="block text-sm font-medium text-slate-700">{label}<input required={required} type={type} minLength={key === "password" ? 12 : undefined} value={newUser[key]} onChange={(e) => setNewUser((v) => ({ ...v, [key]: e.target.value }))} className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>)}
            <label className="block text-sm font-medium text-slate-700">Assigned role<select required value={newUser.role} onChange={(e) => setNewUser((v) => ({ ...v, role: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">{directory.roles.filter((r) => r.name !== "NATIONAL_ADMIN").map((r) => <option key={r.name} value={r.name}>{r.name.replaceAll("_", " ")}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">State<select value={newUser.state_id} onChange={(e) => setNewUser((v) => ({ ...v, state_id: e.target.value, district_id: "" }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Not assigned</option>{directory.jurisdictions.filter((j) => j.level.toUpperCase() === "STATE").map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">District<select value={newUser.district_id} onChange={(e) => setNewUser((v) => ({ ...v, district_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Not assigned</option>{directory.jurisdictions.filter((j) => j.level.toUpperCase() === "DISTRICT" && (!newUser.state_id || j.parent_id === newUser.state_id)).map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Division<select value={newUser.division_id} onChange={(e) => setNewUser((v) => ({ ...v, division_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Not assigned</option>{directory.jurisdictions.filter((j) => j.level.toUpperCase() === "DIVISION").map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Organization<select value={newUser.organization_id} onChange={(e) => setNewUser((v) => ({ ...v, organization_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Not assigned</option>{directory.organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className={button} disabled={busy}>{busy ? "Creating…" : "Create official account"}</button></div>
        </form>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder="Search name, username, email or role…" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm sm:max-w-md" /><span className="text-sm text-slate-500 sm:self-center">{data.users.length} accounts</span></div>
        <div className="mt-4 grid gap-3 md:hidden">{data.users.filter((u) => `${u.full_name || ""} ${u.username} ${u.email || ""} ${u.role}`.toLowerCase().includes(searchUsers.toLowerCase())).map((u) => <article key={u.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-words font-semibold text-slate-900">{u.full_name || u.username}</p><p className="break-all text-xs text-slate-500">@{u.username} · {u.email || "No email"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{u.is_active ? "Active" : "Disabled"}</span></div><p className="mt-2 text-sm text-slate-600">{u.role.replaceAll("_", " ")} · {u.designation || "Official"}</p><div className="mt-3 flex flex-wrap gap-2"><button className="rounded-lg border px-3 py-2 text-xs font-semibold" disabled={busy || u.role === "NATIONAL_ADMIN" && u.is_active} onClick={() => toggleUser(u)}>{u.is_active ? "Disable" : "Enable"}</button>{u.role !== "NATIONAL_ADMIN" && <><button className="rounded-lg border px-3 py-2 text-xs font-semibold" disabled={busy} onClick={() => editOfficial(u)}>Change role</button><button className="rounded-lg border px-3 py-2 text-xs font-semibold" disabled={busy} onClick={() => resetOfficialPassword(u)}>Reset password</button></>}</div></article>)}</div>
        <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 md:block"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Official</th><th className="p-3">Role</th><th className="p-3">Department</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{data.users.filter((u) => `${u.full_name || ""} ${u.username} ${u.email || ""} ${u.role}`.toLowerCase().includes(searchUsers.toLowerCase())).map((u) => <tr key={u.id} className="border-t"><td className="p-3"><p className="font-semibold">{u.full_name || u.username}</p><p className="text-xs text-slate-500">{u.username} · {u.email || "No email"}</p></td><td className="p-3">{u.role.replaceAll("_", " ")}</td><td className="p-3">{u.department || "—"}</td><td className="p-3">{u.is_active ? "Active" : "Disabled"}</td><td className="p-3"><div className="flex flex-wrap gap-2"><button className="rounded-md border px-2.5 py-1.5 text-xs font-semibold" disabled={busy || u.role === "NATIONAL_ADMIN" && u.is_active} onClick={() => toggleUser(u)}>{u.is_active ? "Disable" : "Enable"}</button>{u.role !== "NATIONAL_ADMIN" && <><button className="rounded-md border px-2.5 py-1.5 text-xs font-semibold" disabled={busy} onClick={() => editOfficial(u)}>Change role</button><button className="rounded-md border px-2.5 py-1.5 text-xs font-semibold" disabled={busy} onClick={() => resetOfficialPassword(u)}>Reset password</button></>}</div></td></tr>)}</tbody></table></div>
      </section>

      <section className={panel}>
        <h2 className="text-xl font-bold text-slate-900">Identity verification</h2>
        <p className="mt-1 text-sm text-slate-500">Optional document submission and review. Documents are encrypted before storage; reviewers need SECURITY_VIEW.</p>
        <form onSubmit={submitIdentity} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
          <label className="text-sm font-medium text-slate-700">Document category
            <select value={identityType} onChange={(e) => setIdentityType(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="OFFICIAL_EMPLOYEE_ID">Official employee ID</option>
              <option value="GOVERNMENT_ID">Government-issued ID</option>
              <option value="OTHER">Other approved credential</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">PDF / JPEG / PNG (max 5 MB)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => setIdentityFile(e.target.files?.[0] || null)} className="mt-1 block max-w-full text-sm" />
          </label>
          <button className={button} disabled={busy || !identityFile}>Submit my ID</button>
        </form>
        {identity.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No identity documents have been submitted.</p> : (
          <div className="mt-4 space-y-3">
            {identity.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div><p className="font-semibold text-slate-800">{item.filename}</p><p className="mt-1 text-xs text-slate-500">{item.document_type} · {item.status} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p>{item.review_note && <p className="mt-1 text-xs text-slate-600">{item.review_note}</p>}</div>
              <div className="flex flex-wrap gap-2"><button className="rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => downloadDocument(item)}>Download securely</button>{item.status === "PENDING" && <><button className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white" onClick={() => reviewIdentity(item, "VERIFIED")}>Verify</button><button className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white" onClick={() => reviewIdentity(item, "REJECTED")}>Reject</button></>}</div>
            </div>)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
        <strong>Identity-data policy:</strong> Do not request Aadhaar by default. Prefer an official employee/department ID or another minimally necessary government-issued credential. Collect only when policy requires it, restrict reviewers, define a deletion/retention period, and configure a persistent encrypted database backup. Uploads stay disabled until the server has a valid IDENTITY_ENCRYPTION_KEY.
      </section>
    </main>
  );
}
