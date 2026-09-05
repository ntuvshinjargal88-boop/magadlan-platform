import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const { id } = await params;
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.orgId, session.orgId)));
  return NextResponse.json({ ok: true });
}
