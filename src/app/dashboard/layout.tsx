import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = session.orgId
    ? await db.query.organizations.findFirst({ where: eq(organizations.id, session.orgId) })
    : null;

  const isOrgAdmin = session.role === "ORG_ADMIN";
  const isSuperAdmin = session.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-lg font-semibold text-sky-700">МагадланПро</p>
          {org && <p className="mt-0.5 truncate text-xs text-slate-500">{org.name}</p>}
          {isSuperAdmin && <p className="mt-0.5 text-xs text-amber-600">Платформ админ</p>}
        </div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          <NavLink href="/dashboard">Тойм</NavLink>
          <NavLink href="/dashboard/criteria">Магадлангийн шалгуур</NavLink>
          <NavLink href="/dashboard/iso-criteria">MNS ISO 15189:2024 шалгуур</NavLink>
          <NavLink href="/dashboard/documents">Тушаал, журам</NavLink>
          {isOrgAdmin && <NavLink href="/dashboard/admin/users">Хэрэглэгчид</NavLink>}
          {isSuperAdmin && (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Платформ удирдлага
              </p>
              <NavLink href="/dashboard/admin/organizations">Эмнэлгүүд</NavLink>
              <NavLink href="/dashboard/admin/criteria">Шалгуур удирдах</NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              {session.name} · <span className="text-slate-400">{roleLabel(session.role)}</span>
            </span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
    >
      {children}
    </Link>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Платформ админ";
    case "ORG_ADMIN":
      return "Эмнэлгийн админ";
    case "QUALITY_MANAGER":
      return "Чанарын менежер";
    default:
      return "Ажилтан";
  }
}
