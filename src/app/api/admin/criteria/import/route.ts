import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { upsertChapter } from "@/db/import-logic";

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

  // Upsert by chapter `code`: if the chapter already exists (e.g. "Бүлэг 1"
  // already has subchapters 1-2 seeded), only the subchapters not yet present
  // are appended to it instead of creating a duplicate chapter row.
  const { chapter, addedSubChapters, addedCriteria } = await upsertChapter(raw);

  return NextResponse.json({
    ok: true,
    chapterId: chapter.id,
    addedSubChapters,
    addedCriteria,
  });
}
