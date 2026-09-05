import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { documentCriterionLinks } from "@/db/schema";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; criterionId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const { id, criterionId } = await params;
  await db
    .delete(documentCriterionLinks)
    .where(
      and(
        eq(documentCriterionLinks.documentId, id),
        eq(documentCriterionLinks.criterionId, criterionId),
        eq(documentCriterionLinks.orgId, session.orgId)
      )
    );
  return NextResponse.json({ ok: true });
}
