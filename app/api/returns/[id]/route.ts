import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

const updateReturnSchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "ITEM_RECEIVED", "REFUNDED", "COMPLETED"]),
  adminNotes: z.string().optional().nullable(),
  refundAmount: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateReturnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const existing = await prisma.returnRequest.findUnique({
    where: { id: params.id },
    include: { order: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "طلب الاسترجاع غير موجود" }, { status: 404 });
  }

  const updateData: any = {
    status: parsed.data.status,
    adminNotes: parsed.data.adminNotes !== undefined ? parsed.data.adminNotes : existing.adminNotes,
  };
  if (parsed.data.refundAmount !== undefined) {
    updateData.refundAmount = parsed.data.refundAmount;
  }

  const updated = await prisma.returnRequest.update({
    where: { id: params.id },
    data: updateData,
  });

  if (parsed.data.status === "REFUNDED") {
    await prisma.order.update({
      where: { id: existing.orderId },
      data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
    });
  } else if (parsed.data.status === "ITEM_RECEIVED") {
    await prisma.order.update({
      where: { id: existing.orderId },
      data: { status: "RETURNED" },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "update_return_status",
      details: `تم تحديث حالة طلب الاسترجاع إلى ${updated.status}`,
    },
  });

  return NextResponse.json({ returnRequest: updated });
}
