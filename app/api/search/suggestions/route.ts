import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/search/suggestions?q=...
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ products: [], categories: [] });

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nameEn: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      take: 6,
      select: { id: true, name: true, slug: true, price: true, images: { take: 1, select: { url: true } } },
    }),
    prisma.category.findMany({
      where: { active: true, name: { contains: q, mode: "insensitive" } },
      take: 4,
      select: { name: true, slug: true },
    }),
  ]);

  return NextResponse.json({ products, categories });
}
