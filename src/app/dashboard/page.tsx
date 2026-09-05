import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getComplianceTree, summarize } from "@/lib/compliance";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.orgId) {
    redirect("/dashboard/admin/organizations");
  }

  const tree = await getComplianceTree(session.orgId);
  const summary = summarize(tree);
  const recentDocs = await db.query.documents.findMany({
    where: eq(documents.orgId, session.orgId),
    orderBy: [desc(documents.createdAt)],
    limit: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Тойм</h1>
        <p className="text-sm text-slate-500">Магадлан итгэмжлэлийн бэлэн байдлын ерөнхий байдал</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Нийт шалгуур" value={summary.total.toString()} />
        <StatCard label="Хангасан" value={summary.compliant.toString()} tone="green" />
        <StatCard label="Хийгдэж буй" value={summary.inProgress.toString()} tone="amber" />
        <StatCard label="Хараахан эхлээгүй" value={summary.notStarted.toString()} tone="slate" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Ерөнхий бэлэн байдал</h2>
          <span className="text-2xl font-bold text-sky-700">{summary.pct}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-sky-600" style={{ width: `${summary.pct}%` }} />
        </div>

        <div className="mt-6 space-y-3">
          {summary.perChapter.map((ch) => (
            <div key={ch.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  Бүлэг {ch.code}. {ch.title}
                </span>
                <span className="text-slate-500">
                  {ch.compliant}/{ch.total} ({ch.pct}%)
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${ch.pct}%` }} />
              </div>
            </div>
          ))}
          {summary.perChapter.length === 0 && (
            <p className="text-sm text-slate-500">Одоогоор шалгуур бүртгэгдээгүй байна.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Сүүлд орсон баримт бичиг</h2>
          <Link href="/dashboard/documents" className="text-sm text-sky-700 hover:underline">
            Бүгдийг харах
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {recentDocs.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">{d.title}</span>
              <span className="text-slate-400">{d.category}</span>
            </li>
          ))}
          {recentDocs.length === 0 && (
            <li className="py-2 text-sm text-slate-500">Одоогоор баримт бичиг ороогүй байна.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "sky",
}: {
  label: string;
  value: string;
  tone?: "sky" | "green" | "amber" | "slate";
}) {
  const colors: Record<string, string> = {
    sky: "text-sky-700",
    green: "text-emerald-600",
    amber: "text-amber-600",
    slate: "text-slate-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[tone]}`}>{value}</p>
    </div>
  );
}
