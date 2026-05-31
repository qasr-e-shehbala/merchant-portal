import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// High-quality Unsplash images for each product (base URLs — loader adds sizing)
const PRODUCT_IMAGES: Record<string, { alt: string; urls: string[] }[]> = {
  "black-velvet-embroidered-sherwani": [
    {
      alt: "Black velvet embroidered groom sherwani with tonal dabka work",
      urls: [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22",
      ],
    },
  ],
  "ivory-jamawar-sherwani": [
    {
      alt: "Ivory jamawar groom sherwani with self-woven paisley pattern",
      urls: [
        "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176",
        "https://images.unsplash.com/photo-1626785774573-4b799315345d",
      ],
    },
  ],
  "bottle-green-velvet-sherwani": [
    {
      alt: "Bottle green velvet groom sherwani with gold zardozi embroidery",
      urls: [
        "https://images.unsplash.com/photo-1598520106830-8c45c2035460",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22",
      ],
    },
  ],
  "navy-prince-coat": [
    {
      alt: "Navy blue prince coat for groom walima in fine wool-blend",
      urls: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
      ],
    },
  ],
  "charcoal-prince-coat": [
    {
      alt: "Charcoal grey prince coat for groom with structured shoulder",
      urls: [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
        "https://images.unsplash.com/photo-1488161628813-04466f872be2",
      ],
    },
  ],
  "ivory-embroidered-waistcoat": [
    {
      alt: "Ivory embroidered groom waistcoat with subtle thread work for nikah",
      urls: [
        "https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22",
      ],
    },
  ],
};

async function main() {
  for (const [slug, imageGroups] of Object.entries(PRODUCT_IMAGES)) {
    const product = await prisma.product.findFirst({ where: { slug } });
    if (!product) {
      console.log(`Product not found: ${slug}`);
      continue;
    }

    // Delete existing placeholder images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Insert real image URLs
    let sortOrder = 0;
    for (const group of imageGroups) {
      for (const url of group.urls) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            r2Key: url,
            alt: group.alt,
            sortOrder: sortOrder++,
          },
        });
      }
    }

    console.log(`✓ Updated images for: ${slug}`);
  }

  console.log("\nAll product images updated.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
