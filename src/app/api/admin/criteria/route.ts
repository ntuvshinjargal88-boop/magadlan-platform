import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }

  const allChapters = await db.query.chapters.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
    with: {
      subChapters: {
        orderBy: (s, { asc }) => [asc(s.sortOrder)],
        with: { criteria: true },
      },
    },
  });

  const result = allChapters.map((ch) => ({
    id: ch.id,
    code: ch.code,
    title: ch.title,
    subChapterCount: ch.subChapters.length,
    criteriaCount: ch.subChapters.reduce((sum, s) => sum + s.criteria.length, 0),
  }));

  return NextResponse.json({ chapters: result });
}
