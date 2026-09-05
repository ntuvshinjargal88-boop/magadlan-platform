"use client";

import { useEffect, useState } from "react";

type OrgItem = {
  id: string;
  name: string;
  registerNumber: string | null;
  phone: string | null;
  plan: string;
  createdAt: string;
  userCount: number;
  pct: number;
  total: number;
  compliant: number;
};

export default function OrganizationsClient() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((data) => setOrgs(data.organizations ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Ачааллаж байна...</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Байгууллага</th>
            <th className="px-4 py-2">Регистр</th>
            <th className="px-4 py-2">Утас</th>
            <th className="px-4 py-2">Хэрэглэгч</th>
            <th className="px-4 py-2">Бэлэн байдал</th>
            <th className="px-4 py-2">Бүртгүүлсэн</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orgs.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-2.5 font-medium text-slate-800">{o.name}</td>
              <td className="px-4 py-2.5 text-slate-500">{o.registerNumber || "—"}</td>
              <td className="px-4 py-2.5 text-slate-500">{o.phone || "—"}</td>
              <td className="px-4 py-2.5">{o.userCount}</td>
              <td className="px-4 py-2.5">
                {o.pct}% ({o.compliant}/{o.total})
              </td>
              <td className="px-4 py-2.5 text-slate-500">
                {new Date(o.createdAt).toLocaleDateString("mn-MN")}
              </td>
            </tr>
          ))}
          {orgs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                Одоогоор эмнэлэг бүртгүүлээгүй байна.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
