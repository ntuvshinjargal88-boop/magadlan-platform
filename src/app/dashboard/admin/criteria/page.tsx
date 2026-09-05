import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CriteriaAdminClient from "./criteria-admin-client";

export default async function CriteriaAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Шалгуур удирдах</h1>
        <p className="text-sm text-slate-500">
          Магадлан шинжлэх шалгуурын бүлгүүд бүх байгууллагад нэг тогтолцоогоор ашиглагдана. Шинэ бүлэг (ж: тухайн
          тушаалын дараагийн бүлгүүд) JSON форматаар оруулна уу.
        </p>
      </div>
      <CriteriaAdminClient />
    </div>
  );
}
