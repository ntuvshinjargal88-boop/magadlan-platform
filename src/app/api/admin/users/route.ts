import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "ORG_ADMIN" || !session.orgId) {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }

  const list = await db.query.users.findMany({ where: eq(users.orgId, session.orgId) });
  return NextResponse.json({
    users: list.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
  });
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ORG_ADMIN", "QUALITY_MANAGER", "STAFF"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  if (session.role !== "ORG_ADMIN" || !session.orgId) {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу" }, { status: 400 });
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email.toLowerCase()) });
  if (existing) {
    return NextResponse.json({ error: "Энэ и-мэйл хаяг бүртгэлтэй байна" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.insert(users).values({
    orgId: session.orgId,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
    role: parsed.data.role,
  });

  return NextResponse.json({ ok: true });
}
