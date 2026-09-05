import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth";
import type { Role } from "@/db/schema";

export async function requireSession(): Promise<
  { session: SessionPayload } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 }) };
  }
  return { session };
}

export function requireRole(session: SessionPayload, roles: Role[]) {
  if (!roles.includes(session.role)) {
    return NextResponse.json({ error: "Эрх хүрэлцэхгүй байна" }, { status: 403 });
  }
  return null;
}
