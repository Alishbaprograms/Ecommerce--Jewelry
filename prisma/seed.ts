import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// Starter categories for the kids' jewelry shop. Safe to re-run; the owner manages these from /admin/categories.
const categories = [
  { name: "Magnetic Earrings", slug: "magnetic-earrings", description: "Clip-on magnetic earrings, no piercing needed" },
  { name: "Bead Bracelets", slug: "bead-bracelets", description: "Colourful stretchy bead bracelets" },
  { name: "Bead Necklaces", slug: "bead-necklaces", description: "Little beaded necklaces for little necks" },
  { name: "Necklaces", slug: "necklaces", description: "Sweet pendants and chains" },
  { name: "Hair Accessories", slug: "hair-accessories", description: "Clips, bands and bows" },
  { name: "Rings", slug: "rings", description: "Adjustable rings for tiny fingers" },
];

async function main() {
  console.log("Seeding database...");

  for (const [i, c] of categories.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i, isActive: true },
    });
  }
  console.log(`Ensured ${categories.length} categories`);

  await db.setting.upsert({
    where: { key: "store.name" },
    update: {},
    create: { key: "store.name", value: "Zohraé", group: "store" },
  });
  await db.setting.upsert({
    where: { key: "store.currency" },
    update: { value: "PKR" },
    create: { key: "store.currency", value: "PKR", group: "store" },
  });

  console.log("Done. Add products from /admin/products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
