import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { organizations, users } from "./schema";

// One-off, idempotent: ensures the "Клинико Эмнэлэг" org exists and links the
// platform owner's account to it (needed for org-scoped features like the
// Documents feature, which requires session.orgId).
async function main() {
  const ORG_NAME = "Клинико Эмнэлэг";
  const OWNER_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "ntuvshinjargal88@gmail.com").toLowerCase();

  let org = await db.query.organizations.findFirst({ where: eq(organizations.name, ORG_NAME) });
  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({
        name: ORG_NAME,
        registerNumber: "9011616144",
        address: "Хан-Уул дүүрэг, 2-р хороо, 35Г байр, 2-3 давхар, Улаанбаатар",
        phone: "7611-3000",
        plan: "active",
      })
      .returning();
    console.log(`Org created: ${org.id} (${org.name})`);
  } else {
    console.log(`Org already exists: ${org.id} (${org.name})`);
  }

  const owner = await db.query.users.findFirst({ where: eq(users.email, OWNER_EMAIL) });
  if (!owner) {
    console.log(`Owner user not found: ${OWNER_EMAIL} — skipping link.`);
  } else if (owner.orgId === org.id) {
    console.log(`Owner already linked to org.`);
  } else {
    await db.update(users).set({ orgId: org.id }).where(eq(users.id, owner.id));
    console.log(`Linked ${OWNER_EMAIL} -> org ${org.id}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
