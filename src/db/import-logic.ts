import { eq } from "drizzle-orm";
import { db } from "./index";
import { chapters, subChapters, criteria, indicators } from "./schema";

export type CriterionInput = {
  code: string;
  requirement: string;
  title: string;
  indicators?: string[];
  scoreOptions?: string;
};
export type SubChapterInput = {
  code: string;
  title: string;
  criteria: CriterionInput[];
};
export type ChapterInput = {
  code: string;
  title: string;
  sourceOrder?: string | null;
  subChapters: SubChapterInput[];
};

/**
 * Upsert a chapter by its `code`:
 * - If a chapter with this code doesn't exist yet, it is created.
 * - If it already exists, only subchapters whose `code` is not already present
 *   under that chapter are appended (existing subchapters/criteria are left
 *   untouched). This makes bulk imports safe to re-run.
 */
export async function upsertChapter(raw: ChapterInput) {
  let chapter = await db.query.chapters.findFirst({
    where: eq(chapters.code, raw.code),
  });

  if (!chapter) {
    const existingCount = await db.$count(chapters);
    [chapter] = await db
      .insert(chapters)
      .values({
        code: raw.code,
        title: raw.title,
        sourceOrder: raw.sourceOrder ?? null,
        sortOrder: existingCount + 1,
      })
      .returning();
  }

  const existingSubs = await db.query.subChapters.findMany({
    where: eq(subChapters.chapterId, chapter.id),
  });
  const existingCodes = new Set(existingSubs.map((s) => s.code));
  let subOrder = existingSubs.length;
  let addedSubChapters = 0;
  let addedCriteria = 0;

  for (const sub of raw.subChapters) {
    if (existingCodes.has(sub.code)) continue; // already imported, skip (idempotent)
    subOrder++;
    const [subChapter] = await db
      .insert(subChapters)
      .values({ chapterId: chapter.id, code: sub.code, title: sub.title, sortOrder: subOrder })
      .returning();
    addedSubChapters++;

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
          scoreOptions: crit.scoreOptions ?? "5,4,3,2,0",
          sortOrder: critOrder,
        })
        .returning();
      addedCriteria++;

      let idx = 0;
      for (const text of crit.indicators ?? []) {
        idx++;
        await db.insert(indicators).values({ criterionId: criterion.id, idx, text });
      }
    }
  }

  return { chapter, addedSubChapters, addedCriteria };
}
