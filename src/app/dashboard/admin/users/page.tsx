import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ORG_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Хэрэглэгчид</h1>
        <p className="text-sm text-slate-500">Байгууллагынхаа хэрэглэгчдийг удирдана</p>
      </div>
      <UsersClient />
    </div>
  );
}
