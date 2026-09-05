import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { getComplianceTree, summarize } from "@/lib/compliance";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }

  const orgs = await db.query.organizations.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    with: { users: true },
  });

  const result = await Promise.all(
    orgs.map(async (org) => {
      const tree = await getComplianceTree(org.id);
      const summary = summarize(tree);
      return {
        id: org.id,
        name: org.name,
        registerNumber: org.registerNumber,
        phone: org.phone,
        plan: org.plan,
        createdAt: org.createdAt,
        userCount: org.users.length,
        pct: summary.pct,
        total: summary.total,
        compliant: summary.compliant,
      };
    })
  );

  return NextResponse.json({ organizations: result });
}
