"use client";

import { useEffect, useState } from "react";

type UserItem = { id: string; name: string; email: string; role: string; createdAt: string };

const ROLE_LABEL: Record<string, string> = {
  ORG_ADMIN: "Админ",
  QUALITY_MANAGER: "Чанарын менежер",
  STAFF: "Ажилтан",
};

export default function UsersClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users").then((r) => r.json());
      setUsers(res.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          {showForm ? "Хаах" : "+ Хэрэглэгч нэмэх"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="input"
              placeholder="Нэр"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="И-мэйл"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Нууц үг (6+ тэмдэгт)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STAFF">Ажилтан</option>
              <option value="QUALITY_MANAGER">Чанарын менежер</option>
              <option value="ORG_ADMIN">Админ</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Хадгалж байна..." : "Нэмэх"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Ачааллаж байна...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Нэр</th>
                <th className="px-4 py-2">И-мэйл</th>
                <th className="px-4 py-2">Эрх</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">{u.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2.5">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => removeUser(u.id)} className="text-xs text-red-500 hover:underline">
                      Устгах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
