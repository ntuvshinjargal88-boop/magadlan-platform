import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { upsertChapter, type ChapterInput } from "./import-logic";

// One-off (but idempotent/safe to re-run) bulk import of the remaining
// chapters/subchapters from the А/554 order (2019.12.06). Files live in
// bulk-import-data/ at the repo root. Each run only adds subchapters that
// aren't already present under their chapter, so re-running on every deploy
// is harmless.
const FILES = ["ch1-new-subs.json", "ch2.json", "ch3.json"];

async function main() {
  const dir = path.join(process.cwd(), "bulk-import-data");
  if (!existsSync(dir)) {
    console.log("bulk-import-data/ not found, skipping bulk import.");
    process.exit(0);
  }

  for (const file of FILES) {
    const filePath = path.join(dir, file);
    if (!existsSync(filePath)) {
      console.log(`  ${file}: not found, skipping`);
      continue;
    }
    const raw: ChapterInput = JSON.parse(readFileSync(filePath, "utf-8"));
    const { chapter, addedSubChapters, addedCriteria } = await upsertChapter(raw);
    console.log(
      `Chapter ${chapter.code} (${file}): +${addedSubChapters} subchapters, +${addedCriteria} criteria`
    );
  }

  console.log("Bulk import complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
