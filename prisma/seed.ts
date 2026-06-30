import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "rings" },
      update: {},
      create: {
        name: "Rings",
        slug: "rings",
        description: "From delicate bands to statement pieces",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "necklaces" },
      update: {},
      create: {
        name: "Necklaces",
        slug: "necklaces",
        description: "Layerable chains and statement pendants",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "earrings" },
      update: {},
      create: {
        name: "Earrings",
        slug: "earrings",
        description: "Studs, hoops, and drops",
        image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80",
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "bracelets" },
      update: {},
      create: {
        name: "Bracelets",
        slug: "bracelets",
        description: "Stacking bracelets and bangles",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Collections
  const collection = await db.collection.upsert({
    where: { slug: "new-arrivals-2025" },
    update: {},
    create: {
      name: "New Arrivals 2025",
      slug: "new-arrivals-2025",
      description: "Our latest fine jewelry pieces",
      isActive: true,
      isFeatured: true,
    },
  });

  // Sample products
  const products = [
    {
      name: "Aurora Diamond Ring",
      slug: "aurora-diamond-ring",
      description: "A breathtaking solitaire diamond ring featuring a round brilliant cut diamond set in 18K white gold. The sleek, minimalist band draws all attention to the stunning stone.",
      shortDescription: "Round brilliant diamond in 18K white gold",
      basePrice: 1250,
      material: "18K White Gold",
      metalType: "White Gold",
      metalPurity: "18K",
      stoneType: "Diamond",
      categorySlug: "rings",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      isNewArrival: true,
      isBestSeller: false,
      isFeatured: true,
      variants: [
        { name: "Size 6", sku: "ARD-WG-6", price: 1250, stock: 5, attributes: [{ name: "Ring Size", value: "6" }] },
        { name: "Size 7", sku: "ARD-WG-7", price: 1250, stock: 8, attributes: [{ name: "Ring Size", value: "7" }], isDefault: true },
        { name: "Size 8", sku: "ARD-WG-8", price: 1250, stock: 3, attributes: [{ name: "Ring Size", value: "8" }] },
      ],
    },
    {
      name: "Celestial Pendant Necklace",
      slug: "celestial-necklace",
      description: "A delicate pendant featuring a moonstone center surrounded by pavé diamonds, suspended from a fine 18K gold chain. This piece captures the magic of a starlit sky.",
      shortDescription: "Moonstone & diamond pendant in 18K gold",
      basePrice: 485,
      compareAtPrice: 620,
      material: "18K Gold",
      metalType: "Yellow Gold",
      metalPurity: "18K",
      stoneType: "Moonstone & Diamond",
      categorySlug: "necklaces",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      variants: [
        { name: "16 inch", sku: "CPN-YG-16", price: 485, compareAtPrice: 620, stock: 12, attributes: [{ name: "Chain Length", value: "16 inch" }] },
        { name: "18 inch", sku: "CPN-YG-18", price: 485, compareAtPrice: 620, stock: 9, attributes: [{ name: "Chain Length", value: "18 inch" }], isDefault: true },
      ],
    },
    {
      name: "Pearl Drop Earrings",
      slug: "pearl-drop-earrings",
      description: "Classic freshwater pearl drop earrings with 18K gold fittings. These timeless pieces transition seamlessly from day to evening wear.",
      shortDescription: "Freshwater pearl drops with gold fittings",
      basePrice: 325,
      material: "18K Gold & Freshwater Pearl",
      metalType: "Yellow Gold",
      metalPurity: "18K",
      stoneType: "Freshwater Pearl",
      categorySlug: "earrings",
      image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
      isNewArrival: true,
      isBestSeller: false,
      isFeatured: false,
      variants: [
        { name: "Default", sku: "PDE-YG-001", price: 325, stock: 15, isDefault: true },
      ],
    },
    {
      name: "18K Gold Cuff Bracelet",
      slug: "gold-cuff-bracelet",
      description: "A statement cuff bracelet hand-hammered from solid 18K gold. Each piece is unique with subtle variations that reflect the handcrafted process.",
      shortDescription: "Hand-hammered solid 18K gold cuff",
      basePrice: 895,
      material: "18K Yellow Gold",
      metalType: "Yellow Gold",
      metalPurity: "18K",
      categorySlug: "bracelets",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
      isNewArrival: true,
      isBestSeller: true,
      isFeatured: true,
      variants: [
        { name: "Small (6.5 in)", sku: "GCB-YG-S", price: 895, stock: 4, attributes: [{ name: "Size", value: "Small" }] },
        { name: "Medium (7 in)", sku: "GCB-YG-M", price: 895, stock: 7, attributes: [{ name: "Size", value: "Medium" }], isDefault: true },
        { name: "Large (7.5 in)", sku: "GCB-YG-L", price: 895, stock: 3, attributes: [{ name: "Size", value: "Large" }] },
      ],
    },
  ];

  for (const productData of products) {
    const category = categories.find((c) => c.slug === productData.categorySlug);

    const existing = await db.product.findUnique({ where: { slug: productData.slug } });
    if (existing) continue;

    const product = await db.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        basePrice: productData.basePrice,
        compareAtPrice: productData.compareAtPrice,
        material: productData.material,
        metalType: productData.metalType,
        metalPurity: productData.metalPurity,
        stoneType: productData.stoneType,
        categoryId: category?.id,
        status: "ACTIVE",
        isNewArrival: productData.isNewArrival,
        isBestSeller: productData.isBestSeller,
        isFeatured: productData.isFeatured,
        engravingEnabled: true,
        giftWrapEnabled: true,
        careInstructions: "Store in a soft pouch. Avoid contact with chemicals and perfumes. Clean with a soft cloth.",
        images: {
          create: {
            url: productData.image,
            isPrimary: true,
            sortOrder: 0,
          },
        },
        variants: {
          create: productData.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            compareAtPrice: (v as { compareAtPrice?: number }).compareAtPrice,
            stock: v.stock,
            isDefault: (v as { isDefault?: boolean }).isDefault ?? false,
            attributes: {
              create: ((v as { attributes?: Array<{ name: string; value: string }> }).attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
            },
          })),
        },
        collections: {
          create: { collectionId: collection.id },
        },
      },
    });

    console.log(`✅ Created product: ${product.name}`);
  }

  // Settings
  await db.setting.upsert({
    where: { key: "store.name" },
    update: {},
    create: { key: "store.name", value: "Zohraé", group: "store" },
  });

  await db.setting.upsert({
    where: { key: "store.currency" },
    update: {},
    create: { key: "store.currency", value: "USD", group: "store" },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
