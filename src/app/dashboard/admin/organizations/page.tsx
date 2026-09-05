import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import OrganizationsClient from "./organizations-client";

export default async function OrganizationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Бүртгэлтэй эмнэлгүүд</h1>
        <p className="text-sm text-slate-500">Платформ дээр бүртгэлтэй бүх байгууллагын жагсаалт</p>
      </div>
      <OrganizationsClient />
    </div>
  );
}
