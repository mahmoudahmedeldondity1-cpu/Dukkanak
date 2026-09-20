import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

// GET /api/products?category=&brand=&minPrice=&maxPrice=&sort=&q=&page=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = parseInt(sp.get("page") || "1");
  const pageSize = 24;

  const where: any = { status: "PUBLISHED" };

  const category = sp.get("category");
  if (category) where.category = { slug: category };

  const brand = sp.get("brand");
  if (brand) where.brand = { slug: brand };

  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const onSale = sp.get("onSale");
  if (onSale === "true") where.onSale = true;

  const isNew = sp.get("isNew");
  if (isNew === "true") where.isNew = true;

  const q = sp.get("q");
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  switch (sp.get("sort")) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { ratingAvg: "desc" };
      break;
    case "bestseller":
      orderBy = { soldCount: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageCount: Math.ceil(total / pageSize),
  });
}

const createSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive(),
  oldPrice: z.number().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional(),
  shortDesc: z.string().optional(),
  fullDesc: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// POST /api/products — Admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      slug: data.slug,
      price: data.price,
      oldPrice: data.oldPrice,
      stock: data.stock,
      categoryId: data.categoryId,
      shortDesc: data.shortDesc,
      fullDesc: data.fullDesc,
      status: "DRAFT",
      images: data.images
        ? { create: data.images.map((url, i) => ({ url, sortOrder: i })) }
        : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "product_created",
      details: `تم إنشاء المنتج ${product.name}`,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
