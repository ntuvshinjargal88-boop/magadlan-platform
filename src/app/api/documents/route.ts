import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { documents, documentCriterionLinks } from "@/db/schema";
import { saveUploadedFile } from "@/lib/storage";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const docs = await db.query.documents.findMany({
    where: eq(documents.orgId, session.orgId),
    orderBy: [desc(documents.createdAt)],
    with: {
      links: { with: { criterion: true } },
    },
  });

  const result = docs.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    docNumber: d.docNumber,
    issueDate: d.issueDate,
    description: d.description,
    fileName: d.fileName,
    fileSize: d.fileSize,
    createdAt: d.createdAt,
    linkedCriteria: d.links.map((l) => ({ id: l.criterion.id, code: l.criterion.code, title: l.criterion.title })),
  }));

  return NextResponse.json({ documents: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (!session.orgId) return NextResponse.json({ error: "Байгууллагагүй хэрэглэгч" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const category = (formData.get("category") as string | null)?.trim() || "Бусад";
  const docNumber = (formData.get("docNumber") as string | null)?.trim() || null;
  const issueDate = (formData.get("issueDate") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;

  if (!file || !title) {
    return NextResponse.json({ error: "Файл болон гарчгийг оруулна уу" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Файлын хэмжээ 25MB-аас хэтэрсэн байна" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { filePath } = await saveUploadedFile(session.orgId, file.name, buffer);

  const [doc] = await db
    .insert(documents)
    .values({
      orgId: session.orgId,
      title,
      category,
      docNumber,
      issueDate,
      description,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      mimeType: file.type || null,
      uploadedById: session.userId,
    })
    .returning();

  const linkCodesRaw = formData.get("criterionIds") as string | null;
  if (linkCodesRaw) {
    const ids = JSON.parse(linkCodesRaw) as string[];
    for (const criterionId of ids) {
      await db.insert(documentCriterionLinks).values({
        documentId: doc.id,
        criterionId,
        orgId: session.orgId,
      });
    }
  }

  return NextResponse.json({ ok: true, id: doc.id });
}
