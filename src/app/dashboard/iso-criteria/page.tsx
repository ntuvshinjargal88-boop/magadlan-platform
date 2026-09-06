import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getComplianceTree } from "@/lib/compliance";
import CriteriaTree from "../criteria/criteria-tree";

export default async function IsoCriteriaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.orgId) redirect("/dashboard/admin/organizations");

  const fullTree = await getComplianceTree(session.orgId);
  const tree = fullTree.filter((ch) => (ch.sourceOrder ?? "").includes("ISO"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">MNS ISO 15189:2024 шалгуур</h1>
        <p className="text-sm text-slate-500">
          Эмнэлгийн лабораторийн чанар, чадавхын шаардлага (ISO 15189) бүлэг тус бүрийн биелэлтийг тэмдэглэнэ үү
        </p>
      </div>
      <CriteriaTree initialTree={tree} />
    </div>
  );
}
