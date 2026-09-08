import { db } from "@/db";
import {
  chapters,
  subChapters,
  criteria,
  indicators,
  orgCriterionStatus,
  documentCriterionLinks,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type CriterionWithStatus = {
  id: string;
  code: string;
  requirement: string;
  title: string;
  scoreOptions: string;
  indicators: { id: string; idx: number; text: string }[];
  linkedDocCount: number;
  status: {
    score: number | null;
    status: string;
    notes: string | null;
    updatedAt: string | null;
  };
};

export type SubChapterTree = {
  id: string;
  code: string;
  title: string;
  criteria: CriterionWithStatus[];
};

export type ChapterTree = {
  id: string;
  code: string;
  title: string;
  sourceOrder: string | null;
  subChapters: SubChapterTree[];
};

export async function getComplianceTree(orgId: string): Promise<ChapterTree[]> {
  const allChapters = await db.query.chapters.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
    with: {
      subChapters: {
        orderBy: (s, { asc }) => [asc(s.sortOrder)],
        with: {
          criteria: {
            orderBy: (c, { asc }) => [asc(c.sortOrder)],
            with: {
              indicators: { orderBy: (i, { asc }) => [asc(i.idx)] },
            },
          },
        },
      },
    },
  });

  const statuses = await db.query.orgCriterionStatus.findMany({
    where: eq(orgCriterionStatus.orgId, orgId),
  });
  const statusMap = new Map(statuses.map((s) => [s.criterionId, s]));

  const linkRows = await db
    .select({ criterionId: documentCriterionLinks.criterionId, count: sql<number>`count(*)::int` })
    .from(documentCriterionLinks)
    .where(eq(documentCriterionLinks.orgId, orgId))
    .groupBy(documentCriterionLinks.criterionId);
  const linkCountMap = new Map(linkRows.map((r) => [r.criterionId, r.count]));

  return allChapters.map((ch) => ({
    id: ch.id,
    code: ch.code,
    title: ch.title,
    sourceOrder: ch.sourceOrder,
    subChapters: ch.subChapters.map((sub) => ({
      id: sub.id,
      code: sub.code,
      title: sub.title,
      criteria: sub.criteria.map((crit) => {
        const s = statusMap.get(crit.id);
        return {
          id: crit.id,
          code: crit.code,
          requirement: crit.requirement,
          title: crit.title,
          scoreOptions: crit.scoreOptions,
          indicators: crit.indicators,
          linkedDocCount: linkCountMap.get(crit.id) ?? 0,
          status: {
            score: s?.score ?? null,
            status: s?.status ?? "NOT_STARTED",
            notes: s?.notes ?? null,
            updatedAt: s?.updatedAt ? s.updatedAt.toISOString() : null,
          },
        };
      }),
    })),
  }));
}

export function summarize(tree: ChapterTree[]) {
  let total = 0;
  let compliant = 0;
  let inProgress = 0;
  let nonCompliant = 0;
  let notStarted = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  const perChapter = tree.map((ch) => {
    let chTotal = 0;
    let chCompliant = 0;
    for (const sub of ch.subChapters) {
      for (const crit of sub.criteria) {
        chTotal++;
        total++;
        if (crit.status.status === "COMPLIANT") {
          chCompliant++;
          compliant++;
        } else if (crit.status.status === "IN_PROGRESS") inProgress++;
        else if (crit.status.status === "NON_COMPLIANT") nonCompliant++;
        else notStarted++;

        if (typeof crit.status.score === "number") {
          scoreSum += crit.status.score;
          scoreCount++;
        }
      }
    }
    return {
      id: ch.id,
      code: ch.code,
      title: ch.title,
      sourceOrder: ch.sourceOrder,
      total: chTotal,
      compliant: chCompliant,
      pct: chTotal > 0 ? Math.round((chCompliant / chTotal) * 100) : 0,
    };
  });
  const perProgram = (
    [
      { key: "A554", label: "Магадлангийн шалгуур (А/554)", isChapter: (s: string | null) => !(s ?? "").includes("ISO") },
      { key: "ISO15189", label: "MNS ISO 15189:2024 шалгуур", isChapter: (s: string | null) => (s ?? "").includes("ISO") },
      ] as const
    ).map((prog) => {
      const chapters = perChapter.filter((ch) => prog.isChapter(ch.sourceOrder));
      const progTotal = chapters.reduce((sum, ch) => sum + ch.total, 0);
      const progCompliant = chapters.reduce((sum, ch) => sum + ch.compliant, 0);
      return {
        key: prog.key,
        label: prog.label,
        total: progTotal,
        compliant: progCompliant,
        pct: progTotal > 0 ? Math.round((progCompliant / progTotal) * 100) : 0,
        chapters,
      };
    });

  return {
    total,
    compliant,
    inProgress,
    nonCompliant,
    notStarted,
    pct: total > 0 ? Math.round((compliant / total) * 100) : 0,
    avgScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    perChapter,
    perProgram,
  };
}
