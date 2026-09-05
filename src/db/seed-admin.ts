import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/password";

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL || "ntuvshinjargal88@gmail.com").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "Magadlan2026!";
  const name = process.env.SUPER_ADMIN_NAME || "Tuvshinjargal";

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    orgId: null,
    email,
    passwordHash,
    name,
    role: "SUPER_ADMIN",
  });

  console.log(`Super admin created: ${email} / password: ${password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
