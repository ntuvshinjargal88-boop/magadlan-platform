import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getComplianceTree } from "@/lib/compliance";
import CriteriaTree from "./criteria-tree";

export default async function CriteriaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.orgId) redirect("/dashboard/admin/organizations");

  const fullTree = await getComplianceTree(session.orgId);
  const tree = fullTree.filter((ch) => !(ch.sourceOrder ?? "").includes("ISO"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Магадлангийн шалгуур үзүүлэлт</h1>
        <p className="text-sm text-slate-500">
          Эрүүл мэндийн сайдын А/554 тушаалын шалгуур үзүүлэлт бүрийн биелэлтийг тэмдэглэнэ үү
        </p>
      </div>
      <CriteriaTree initialTree={tree} />
    </div>
  );
}
