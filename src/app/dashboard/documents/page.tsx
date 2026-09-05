import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DocumentsClient from "./documents-client";

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.orgId) redirect("/dashboard/admin/organizations");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Тушаал, журам, баримт бичиг</h1>
        <p className="text-sm text-slate-500">
          Байгууллагын мөрдөж буй тушаал, журам, стандартыг оруулж, шалгуур үзүүлэлттэй холбоно уу
        </p>
      </div>
      <DocumentsClient />
    </div>
  );
}
