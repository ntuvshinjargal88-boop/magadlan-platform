import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { db } from "./index";
import { chapters, subChapters, criteria, indicators } from "./schema";

async function main() {
  const ifEmpty = process.argv.includes("--if-empty");
  if (ifEmpty) {
    const existing = await db.$count(chapters);
    if (existing > 0) {
      console.log(`Chapters already seeded (${existing}), skipping.`);
      process.exit(0);
    }
  }

  const seedDir = path.join(process.cwd(), "seed-data");
  const files = readdirSync(seedDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const raw = JSON.parse(readFileSync(path.join(seedDir, file), "utf-8"));

    const [chapter] = await db
      .insert(chapters)
      .values({
        code: raw.code,
        title: raw.title,
        sourceOrder: raw.sourceOrder ?? null,
        sortOrder: Number(raw.code) || 0,
      })
      .returning();

    console.log(`Chapter ${chapter.code}: ${chapter.title}`);

    let subOrder = 0;
    for (const sub of raw.subChapters) {
      subOrder++;
      const [subChapter] = await db
        .insert(subChapters)
        .values({
          chapterId: chapter.id,
          code: sub.code,
          title: sub.title,
          sortOrder: subOrder,
        })
        .returning();

      console.log(`  SubChapter ${subChapter.code}: ${subChapter.title}`);

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

        if (Array.isArray(crit.indicators)) {
          let idx = 0;
          for (const text of crit.indicators) {
            idx++;
            await db.insert(indicators).values({
              criterionId: criterion.id,
              idx,
              text,
            });
          }
        }
      }
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
