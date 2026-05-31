import { PrismaClient, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const PKR = (rupees: number): bigint => BigInt(rupees * 100);

// Curated Unsplash images for each product type
const IMG = {
  sherwani: {
    dark: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22",
    ],
    ivory: [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176",
      "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    ],
    green: [
      "https://images.unsplash.com/photo-1598520106830-8c45c2035460",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22",
    ],
    maroon: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    ],
    navy: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    ],
  },
  princeCoat: {
    navy: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    ],
    charcoal: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2",
    ],
    black: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a",
    ],
    maroon: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1595152772835-219674b2a163",
    ],
  },
  waistcoat: {
    general: [
      "https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22",
    ],
  },
  kurta: {
    general: [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    ],
  },
};

async function main() {
  console.log("Seeding database...\n");

  // ── Branch ──────────────────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: "branch-saddar" },
    update: {},
    create: {
      id: "branch-saddar",
      name: "Saddar Flagship",
      city: "Rawalpindi",
      address: "Main Saddar Road, Saddar, Rawalpindi, Punjab",
      phone: "+92 304 5919454",
    },
  });

  // ── Staff ───────────────────────────────────────────────────────────────
  const ownerPassword = await hash("changeme123", 10);
  await prisma.staff.upsert({
    where: { email: "owner@qasarshehbala.pk" },
    update: {},
    create: {
      name: "Qasar Admin",
      email: "owner@qasarshehbala.pk",
      passwordHash: ownerPassword,
      role: "OWNER",
      branchId: branch.id,
    },
  });

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = [
    {
      slug: "groom-wear",
      name: "Groom Wear",
      introCopy: "Complete made-to-measure groom packages — from the barat to the walima. Crafted in Saddar since 1999.",
    },
    {
      slug: "sherwani",
      name: "Sherwani",
      introCopy: "Hand-finished sherwanis in jamawar, velvet and banarsi — the centrepiece of every barat. Made to your exact naap.",
    },
    {
      slug: "prince-coat",
      name: "Prince Coat",
      introCopy: "Sharp, structured prince coats for the walima and semi-formal functions. Re-wearable and refined.",
    },
    {
      slug: "waistcoat",
      name: "Waistcoats",
      introCopy: "Fine waistcoats and shalwar kameez to layer for the nikah, mehndi, and engagement. Light and elegant.",
    },
    {
      slug: "kurta-shalwar",
      name: "Kurta Shalwar",
      introCopy: "Premium kurta shalwar for mehndi, nikah, and casual functions. Classic cuts, quality fabrics.",
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { introCopy: cat.introCopy },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  // ── Fabrics ─────────────────────────────────────────────────────────────
  const fabrics = [
    { code: "JAM-IVR", name: "Jamawar Ivory", composition: "Silk-cotton blend", color: "Ivory" },
    { code: "JAM-NVY", name: "Jamawar Navy", composition: "Silk-cotton blend", color: "Navy" },
    { code: "VEL-BLK", name: "Velvet Black", composition: "Cotton velvet", color: "Black" },
    { code: "VEL-GRN", name: "Velvet Bottle Green", composition: "Cotton velvet", color: "Bottle Green" },
    { code: "VEL-MRN", name: "Velvet Oxblood Maroon", composition: "Cotton velvet", color: "Oxblood Maroon" },
    { code: "BAN-GLD", name: "Banarsi Gold", composition: "Silk with zari", color: "Gold" },
    { code: "BAN-IVR", name: "Banarsi Ivory", composition: "Silk with zari", color: "Ivory" },
    { code: "WOL-CHR", name: "Wool Charcoal", composition: "Fine wool blend", color: "Charcoal" },
    { code: "WOL-NVY", name: "Wool Navy", composition: "Fine wool blend", color: "Navy" },
    { code: "WOL-BLK", name: "Wool Black", composition: "Fine wool blend", color: "Black" },
    { code: "KHD-WHT", name: "Khaddar White", composition: "Pure khaddar", color: "White" },
    { code: "LWN-MNT", name: "Lawn Mint", composition: "Lawn cotton", color: "Mint" },
  ];

  const fabricMap = new Map<string, string>();
  for (const fabric of fabrics) {
    const record = await prisma.fabric.upsert({
      where: { code: fabric.code },
      update: {},
      create: fabric,
    });
    fabricMap.set(fabric.code, record.id);
  }

  // ── Products ─────────────────────────────────────────────────────────────
  const products: {
    slug: string;
    name: string;
    description: string;
    category: string;
    type: "MADE_TO_ORDER" | "STOCK" | "BOTH";
    price: number;
    fabrics: string[];
    images: { url: string; alt: string }[];
    sku: string;
  }[] = [
    // ── Sherwanis ──────────────────────────────────────────────
    {
      slug: "black-velvet-embroidered-sherwani",
      name: "Black Velvet Embroidered Sherwani",
      description:
        "A deep black velvet sherwani with tonal dabka work on the collar and placket. Cut for the barat, finished by hand. The most-requested look of the season — dramatic, confident, unforgettable.",
      category: "sherwani",
      type: "MADE_TO_ORDER",
      price: 165000,
      fabrics: ["VEL-BLK"],
      images: [
        { url: IMG.sherwani.dark[0], alt: "Black velvet embroidered groom sherwani with tonal dabka work" },
        { url: IMG.sherwani.dark[1], alt: "Black velvet sherwani detail — collar and cuff embroidery" },
      ],
      sku: "SHR-VEL-BLK-001",
    },
    {
      slug: "ivory-jamawar-sherwani",
      name: "Ivory Jamawar Sherwani",
      description:
        "An ivory jamawar sherwani with a self-woven paisley pattern and restrained tilla embroidery. A timeless, structured choice for the groom who prefers classic over loud — the sherwani that photographs beautifully at every function.",
      category: "sherwani",
      type: "MADE_TO_ORDER",
      price: 145000,
      fabrics: ["JAM-IVR"],
      images: [
        { url: IMG.sherwani.ivory[0], alt: "Ivory jamawar groom sherwani with self-woven paisley pattern" },
        { url: IMG.sherwani.ivory[1], alt: "Ivory jamawar sherwani detail — tilla embroidery on collar" },
      ],
      sku: "SHR-JAM-IVR-001",
    },
    {
      slug: "bottle-green-velvet-sherwani",
      name: "Bottle Green Velvet Sherwani",
      description:
        "Bottle green velvet with gold zardozi on the collar and cuffs. Rich under indoor lighting and unbeatable for a winter barat — the colour of the season, executed in the finest cotton velvet.",
      category: "sherwani",
      type: "MADE_TO_ORDER",
      price: 175000,
      fabrics: ["VEL-GRN"],
      images: [
        { url: IMG.sherwani.green[0], alt: "Bottle green velvet groom sherwani with gold zardozi embroidery" },
        { url: IMG.sherwani.green[1], alt: "Bottle green velvet sherwani — full length barat look" },
      ],
      sku: "SHR-VEL-GRN-001",
    },
    {
      slug: "oxblood-maroon-velvet-sherwani",
      name: "Oxblood Maroon Velvet Sherwani",
      description:
        "A deep oxblood maroon velvet sherwani — rich, warm, and absolutely regal. Featuring resham embroidery on the collar and front placket. Perfect alongside a bride in red or gold.",
      category: "sherwani",
      type: "MADE_TO_ORDER",
      price: 170000,
      fabrics: ["VEL-MRN"],
      images: [
        { url: IMG.sherwani.maroon[0], alt: "Oxblood maroon velvet groom sherwani with resham embroidery" },
        { url: IMG.sherwani.maroon[1], alt: "Maroon velvet sherwani — barat wedding look" },
      ],
      sku: "SHR-VEL-MRN-001",
    },
    {
      slug: "navy-jamawar-sherwani",
      name: "Navy Jamawar Sherwani",
      description:
        "A structured navy jamawar sherwani with a formal, architectural cut. The heavy self-pattern of the jamawar means minimal additional embroidery is needed — it speaks for itself. Ideal for grooms who want refinement over embellishment.",
      category: "sherwani",
      type: "MADE_TO_ORDER",
      price: 155000,
      fabrics: ["JAM-NVY"],
      images: [
        { url: IMG.sherwani.navy[0], alt: "Navy jamawar groom sherwani structured formal cut" },
        { url: IMG.sherwani.navy[1], alt: "Navy jamawar sherwani — formal wedding portrait" },
      ],
      sku: "SHR-JAM-NVY-001",
    },

    // ── Prince Coats ─────────────────────────────────────────────
    {
      slug: "navy-prince-coat",
      name: "Navy Prince Coat",
      description:
        "A sharply tailored navy prince coat in a fine wool-blend. Minimal, semi-formal, and easy to wear again — the walima favourite of the season. Clean lines and a structured shoulder that flatters every build.",
      category: "prince-coat",
      type: "MADE_TO_ORDER",
      price: 58000,
      fabrics: ["WOL-NVY"],
      images: [
        { url: IMG.princeCoat.navy[0], alt: "Navy blue prince coat for groom walima in fine wool" },
        { url: IMG.princeCoat.navy[1], alt: "Navy prince coat — semi-formal groom look" },
      ],
      sku: "PC-WOL-NVY-001",
    },
    {
      slug: "charcoal-prince-coat",
      name: "Charcoal Prince Coat",
      description:
        "A charcoal prince coat with a structured shoulder and clean lines. One of the most versatile and re-wearable pieces in a groom's wardrobe — equally at home at the walima, a friend's wedding, or a formal dinner.",
      category: "prince-coat",
      type: "MADE_TO_ORDER",
      price: 56000,
      fabrics: ["WOL-CHR"],
      images: [
        { url: IMG.princeCoat.charcoal[0], alt: "Charcoal grey prince coat for groom with structured shoulder" },
        { url: IMG.princeCoat.charcoal[1], alt: "Charcoal prince coat — elegant formal portrait" },
      ],
      sku: "PC-WOL-CHR-001",
    },
    {
      slug: "black-prince-coat",
      name: "Black Prince Coat",
      description:
        "A sharp black prince coat in a fine wool-blend. Pairs beautifully with a plain kameez or a light waistcoat for the walima or engagement. The most formal of the prince coat range — confident and clean.",
      category: "prince-coat",
      type: "MADE_TO_ORDER",
      price: 60000,
      fabrics: ["WOL-BLK"],
      images: [
        { url: IMG.princeCoat.black[0], alt: "Black prince coat for groom formal wear" },
        { url: IMG.princeCoat.black[1], alt: "Black wool prince coat — wedding portrait" },
      ],
      sku: "PC-WOL-BLK-001",
    },
    {
      slug: "maroon-embellished-prince-coat",
      name: "Maroon Embellished Prince Coat",
      description:
        "A maroon prince coat with gold tilla detailing on the collar and cuffs. Bridges the gap between a sherwani and a plain prince coat — ideal for grooms who want celebration without full sherwani formality at the walima.",
      category: "prince-coat",
      type: "MADE_TO_ORDER",
      price: 80000,
      fabrics: ["VEL-MRN"],
      images: [
        { url: IMG.princeCoat.maroon[0], alt: "Maroon embellished prince coat with gold tilla for groom" },
        { url: IMG.princeCoat.maroon[1], alt: "Maroon prince coat — wedding celebration look" },
      ],
      sku: "PC-VEL-MRN-001",
    },

    // ── Waistcoats ──────────────────────────────────────────────
    {
      slug: "ivory-embroidered-waistcoat",
      name: "Ivory Embroidered Waistcoat",
      description:
        "A fine ivory waistcoat with subtle thread work, made to layer over a kurta for the nikah or mehndi. Light, comfortable, and elegant — the detail that elevates a simple kurta into a complete look.",
      category: "waistcoat",
      type: "BOTH",
      price: 18000,
      fabrics: ["BAN-IVR"],
      images: [
        { url: IMG.waistcoat.general[0], alt: "Ivory embroidered groom waistcoat for nikah function" },
        { url: IMG.waistcoat.general[1], alt: "Ivory waistcoat with thread work — detail shot" },
      ],
      sku: "WST-BAN-IVR-001",
    },
    {
      slug: "gold-banarsi-waistcoat",
      name: "Gold Banarsi Waistcoat",
      description:
        "A gold banarsi waistcoat with fine zari work — the statement piece for the mehndi. Rich enough to stand out, light enough to wear for a long evening. Pairs perfectly with a plain white or off-white shalwar kameez.",
      category: "waistcoat",
      type: "BOTH",
      price: 22000,
      fabrics: ["BAN-GLD"],
      images: [
        { url: IMG.waistcoat.general[0], alt: "Gold banarsi waistcoat with zari work for groom mehndi" },
        { url: IMG.waistcoat.general[1], alt: "Gold banarsi waistcoat — mehndi occasion look" },
      ],
      sku: "WST-BAN-GLD-001",
    },

    // ── Kurta Shalwar ──────────────────────────────────────────
    {
      slug: "white-khaddar-kurta-shalwar",
      name: "White Khaddar Kurta Shalwar",
      description:
        "A classic white khaddar kurta shalwar — crisp, clean, and timeless. The go-to for nikah functions and Friday gatherings. Lightweight and breathable, made to your exact measurements for a fit no readymade can match.",
      category: "kurta-shalwar",
      type: "BOTH",
      price: 12000,
      fabrics: ["KHD-WHT"],
      images: [
        { url: IMG.kurta.general[0], alt: "White khaddar kurta shalwar for nikah and casual wear" },
        { url: IMG.kurta.general[1], alt: "White khaddar kurta — classic Pakistani formal look" },
      ],
      sku: "KRT-KHD-WHT-001",
    },
    {
      slug: "off-white-jamawar-kurta-shalwar",
      name: "Off-White Jamawar Kurta Shalwar",
      description:
        "An off-white jamawar kurta shalwar with a self-pattern weave. More formal than plain khaddar, perfect for the mehndi, a nikkah, or as the groom's look for a daytime function. Made to measure for a sharp, tailored silhouette.",
      category: "kurta-shalwar",
      type: "MADE_TO_ORDER",
      price: 28000,
      fabrics: ["JAM-IVR"],
      images: [
        { url: IMG.kurta.general[0], alt: "Off-white jamawar kurta shalwar for mehndi and nikah" },
        { url: IMG.kurta.general[1], alt: "Jamawar kurta — formal daytime groom look" },
      ],
      sku: "KRT-JAM-IVR-001",
    },
  ];

  console.log("Creating products...");
  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { slug: product.slug } });
    if (existing) {
      // Update images if product already exists
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      for (let i = 0; i < product.images.length; i++) {
        await prisma.productImage.create({
          data: { productId: existing.id, r2Key: product.images[i].url, alt: product.images[i].alt, sortOrder: i },
        });
      }
      await prisma.product.update({
        where: { id: existing.id },
        data: { description: product.description, basePriceMinor: PKR(product.price) },
      });
      console.log(`  ↺ Updated: ${product.name}`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        productType: product.type,
        categoryId: categoryMap.get(product.category),
        basePriceMinor: PKR(product.price),
        isPublished: true,
        romanUrduKeywords: "dulha ki sherwani, prince coat banwana, shaadi ka joora",
        images: {
          create: product.images.map((img, i) => ({ r2Key: img.url, alt: img.alt, sortOrder: i })),
        },
        variants: {
          create: [{ sku: product.sku, attributes: { size: "Custom" } as Prisma.InputJsonValue, isStockTracked: product.type === "STOCK" }],
        },
      },
    });

    for (const fabricCode of product.fabrics) {
      const fabricId = fabricMap.get(fabricCode);
      if (!fabricId) continue;
      await prisma.productFabricOption.upsert({
        where: { productId_fabricId: { productId: created.id, fabricId } },
        update: {},
        create: { productId: created.id, fabricId },
      });
    }

    console.log(`  ✓ Created: ${product.name}`);
  }

  // ── Site blocks ──────────────────────────────────────────────────────────
  await prisma.siteBlock.upsert({
    where: { key: "lead_time_days" },
    update: {},
    create: { key: "lead_time_days", value: 15 as Prisma.InputJsonValue },
  });

  console.log(`\nSeed complete:`);
  console.log(`  1 branch, 1 owner`);
  console.log(`  ${categories.length} categories`);
  console.log(`  ${fabrics.length} fabrics`);
  console.log(`  ${products.length} products with Unsplash images`);
  console.log(`\nOwner login: owner@qasarshehbala.pk / changeme123`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
