import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { documents, documentCriterionLinks } from "@/db/schema";

const schema = z.object({ criterionId: z.string().uuid() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Өгөгдөл буруу байна" }, { status: 400 });

  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.orgId, session.orgId)),
  });
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  await db
    .insert(documentCriterionLinks)
    .values({ documentId: id, criterionId: parsed.data.criterionId, orgId: session.orgId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
