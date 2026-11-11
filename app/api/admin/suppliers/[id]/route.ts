import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

const updateSupplierSchema = z.object({
  name: z.string().min(2).optional(),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          sku: true,
          supplierSku: true,
          price: true,
          costPrice: true,
          stock: true,
        },
      },
    },
  });

  if (!supplier) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ supplier });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const supplier = await prisma.supplier.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update_supplier",
      details: `تم تحديث بيانات المورد: ${supplier.name}`,
    },
  });

  return NextResponse.json({ supplier });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  // Check if supplier is linked to any products before attempting deletion
  const linkedProductsCount = await prisma.product.count({
    where: { supplierId: params.id },
  });

  if (linkedProductsCount > 0) {
    // Soft-deactivate instead of hard deleting to preserve referential history
    const deactivated = await prisma.supplier.update({
      where: { id: params.id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "deactivate_supplier",
        details: `تم إلغاء تفعيل المورد ${deactivated.name} بدلاً من الحذف لوجود ${linkedProductsCount} منتج مرتبط به`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم إلغاء تفعيل المورد بدلاً من حذفه لوجود ${linkedProductsCount} منتج مرتبط به حفاظًا على سلامة البيانات`,
      supplier: deactivated,
    });
  }

  const supplier = await prisma.supplier.delete({
    where: { id: params.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "delete_supplier",
      details: `تم حذف المورد ${supplier.name}`,
    },
  });

  return NextResponse.json({ success: true });
}
