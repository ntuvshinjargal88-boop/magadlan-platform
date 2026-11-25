import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/password";

async function main() {
  // Анхдагч и-мэйл, нууц үгийг кодонд БИЧИХГҮЙ (сан нийтэд нээлттэй) — заавал орчны хувьсагчаас.
  // ⚠ Энэ скрипт сервер асах бүрд ажилладаг (`npm start`) тул ХЭЗЭЭ Ч 1-ээр гарахгүй:
  //   тохиргоо дутуу бол админ үүсгэлгүй алгасна — сайт унахгүй.
  const email = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "";
  const name = process.env.SUPER_ADMIN_NAME || "Супер админ";
  if (!email) {
    console.error("SUPER_ADMIN_EMAIL тохируулаагүй — супер админ үүсгэхийг алгаслаа.");
    process.exit(0);
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log("Super admin already exists.");
    process.exit(0);
  }
  if (password.length < 12) {
    console.error("SUPER_ADMIN_PASSWORD (12+ тэмдэгт) тохируулаагүй — супер админ үүсгэхийг алгаслаа.");
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

  console.log("Super admin created.");   // нууц үг, и-мэйлийг логт бичихгүй
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
