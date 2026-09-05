import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { readUploadedFile } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const { id } = await params;
  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.orgId, session.orgId)),
  });
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  const buffer = await readUploadedFile(doc.filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
    },
  });
}
