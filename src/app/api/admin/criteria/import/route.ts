import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { chapters, subChapters, criteria, indicators } from "@/db/schema";

const criterionSchema = z.object({
  code: z.string(),
  requirement: z.string(),
  title: z.string(),
  indicators: z.array(z.string()).default([]),
  scoreOptions: z.string().default("5,4,3,2,0"),
});
const subChapterSchema = z.object({
  code: z.string(),
  title: z.string(),
  criteria: z.array(criterionSchema),
});
const chapterSchema = z.object({
  code: z.string(),
  title: z.string(),
  sourceOrder: z.string().optional(),
  subChapters: z.array(subChapterSchema),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `JSON бүтэц буруу байна: ${parsed.error.issues[0]?.message}` },
      { status: 400 }
    );
  }
  const raw = parsed.data;

  const existingCount = await db.$count(chapters);

  const [chapter] = await db
    .insert(chapters)
    .values({
      code: raw.code,
      title: raw.title,
      sourceOrder: raw.sourceOrder ?? null,
      sortOrder: existingCount + 1,
    })
    .returning();

  let subOrder = 0;
  for (const sub of raw.subChapters) {
    subOrder++;
    const [subChapter] = await db
      .insert(subChapters)
      .values({ chapterId: chapter.id, code: sub.code, title: sub.title, sortOrder: subOrder })
      .returning();

    let critOrder = 0;
    for (const crit of sub.criteria) {
      critOrder++;
      const [criterion] = await db
        .insert(criteria)
        .values({
          subChapterId: subChapter.id,
          code: crit.code,
          requirement: crit.requirement,
          title: crit.title,
          scoreOptions: crit.scoreOptions,
          sortOrder: critOrder,
        })
        .returning();

      let idx = 0;
      for (const text of crit.indicators) {
        idx++;
        await db.insert(indicators).values({ criterionId: criterion.id, idx, text });
      }
    }
  }

  return NextResponse.json({ ok: true, chapterId: chapter.id });
}
