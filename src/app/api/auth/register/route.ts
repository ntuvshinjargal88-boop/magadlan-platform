import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

const schema = z.object({
  orgName: z.string().min(2, "Эмнэлгийн нэрийг оруулна уу"),
  registerNumber: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().min(2, "Нэрээ оруулна уу"),
  email: z.string().email("И-мэйл хаяг буруу байна"),
  password: z.string().min(6, "Нууц үг 6-аас дээш тэмдэгттэй байх ёстой"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Мэдээлэл буруу байна" },
      { status: 400 }
    );
  }
  const { orgName, registerNumber, phone, name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) {
    return NextResponse.json({ error: "Энэ и-мэйл хаяг бүртгэлтэй байна" }, { status: 409 });
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: orgName,
      registerNumber: registerNumber || null,
      phone: phone || null,
    })
    .returning();

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      orgId: org.id,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: "ORG_ADMIN",
    })
    .returning();

  await createSession({
    userId: user.id,
    orgId: org.id,
    role: "ORG_ADMIN",
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({ ok: true });
}
