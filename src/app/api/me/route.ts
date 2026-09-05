import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { organizations } from "@/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  let org = null;
  if (session.orgId) {
    org = await db.query.organizations.findFirst({ where: eq(organizations.id, session.orgId) });
  }

  return NextResponse.json({ user: session, org });
}
