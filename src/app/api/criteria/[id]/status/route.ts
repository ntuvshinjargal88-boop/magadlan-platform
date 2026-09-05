import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { orgCriterionStatus, STATUS_VALUES } from "@/db/schema";

const schema = z.object({
  score: z.number().int().min(0).max(5).nullable().optional(),
  status: z.enum(STATUS_VALUES),
  notes: z.string().max(5000).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Өгөгдөл буруу байна" }, { status: 400 });
  }
  const { score, status, notes } = parsed.data;

  const existing = await db.query.orgCriterionStatus.findFirst({
    where: and(eq(orgCriterionStatus.orgId, session.orgId), eq(orgCriterionStatus.criterionId, id)),
  });

  if (existing) {
    await db
      .update(orgCriterionStatus)
      .set({ score: score ?? null, status, notes: notes ?? null, updatedById: session.userId, updatedAt: new Date() })
      .where(eq(orgCriterionStatus.id, existing.id));
  } else {
    await db.insert(orgCriterionStatus).values({
      orgId: session.orgId,
      criterionId: id,
      score: score ?? null,
      status,
      notes: notes ?? null,
      updatedById: session.userId,
    });
  }

  return NextResponse.json({ ok: true });
}
