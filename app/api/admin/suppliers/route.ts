import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "اسم المورد مطلوب"),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email("بريد إلكتروني غير صالح").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = supplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      contactName: parsed.data.contactName || null,
      contactPhone: parsed.data.contactPhone || null,
      contactEmail: parsed.data.contactEmail || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      active: parsed.data.active ?? true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "create_supplier",
      details: `تم إضافة مورد جديد: ${supplier.name}`,
    },
  });

  return NextResponse.json({ supplier }, { status: 201 });
}
