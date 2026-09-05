import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "ORG_ADMIN" || !session.orgId) {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: "Өөрийгөө устгах боломжгүй" }, { status: 400 });
  }
  await db.delete(users).where(and(eq(users.id, id), eq(users.orgId, session.orgId)));
  return NextResponse.json({ ok: true });
}
