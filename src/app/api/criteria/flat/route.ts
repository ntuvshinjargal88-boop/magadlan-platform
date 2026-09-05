import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  const allChapters = await db.query.chapters.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
    with: {
      subChapters: {
        orderBy: (s, { asc }) => [asc(s.sortOrder)],
        with: { criteria: { orderBy: (c, { asc }) => [asc(c.sortOrder)] } },
      },
    },
  });

  const flat = allChapters.flatMap((ch) =>
    ch.subChapters.flatMap((sub) =>
      sub.criteria.map((c) => ({
        id: c.id,
        code: `${ch.code}.${sub.code}.${c.code}`,
        title: c.title,
      }))
    )
  );

  return NextResponse.json({ criteria: flat });
}
