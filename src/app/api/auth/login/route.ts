import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "И-мэйл болон нууц үгээ оруулна уу" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user) {
    return NextResponse.json({ error: "И-мэйл эсвэл нууц үг буруу байна" }, { status: 401 });
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "И-мэйл эсвэл нууц үг буруу байна" }, { status: 401 });
  }

  await createSession({
    userId: user.id,
    orgId: user.orgId,
    role: user.role as import("@/db/schema").Role,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({ ok: true });
}
