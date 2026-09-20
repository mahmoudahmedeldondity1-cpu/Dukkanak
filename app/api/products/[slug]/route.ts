import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      brand: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId ?? undefined, id: { not: product.id }, status: "PUBLISHED" },
    take: 8,
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ product, related });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }
  const body = await req.json();

  const product = await prisma.product.update({
    where: { slug: params.slug },
    data: body,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "product_edited",
      details: `تم تعديل المنتج ${product.name}`,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const product = await prisma.product.delete({ where: { slug: params.slug } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "product_deleted",
      details: `تم حذف المنتج ${product.name}`,
    },
  });

  return NextResponse.json({ success: true });
}
