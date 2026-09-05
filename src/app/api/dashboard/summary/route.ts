import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getComplianceTree, summarize } from "@/lib/compliance";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const tree = await getComplianceTree(session.orgId);
  const summary = summarize(tree);
  return NextResponse.json({ summary });
}
