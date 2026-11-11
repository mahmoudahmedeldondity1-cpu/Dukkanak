import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

// Explicit administrative endpoint to confirm Cash on Delivery collection
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "تم تحصيل قيمة هذا الطلب بالفعل سابقًا" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const amountCollected = body.amount !== undefined ? Number(body.amount) : Number(order.total);
  const collectionNotes = body.notes || "تم استلام وتحصيل مبلغ الدفع عند الاستلام";

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      notes: order.notes ? `${order.notes} | ${collectionNotes}` : collectionNotes,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "cod_payment_collected",
      details: `تم تأكيد تحصيل مبلغ ${amountCollected} ج.م نقدًا للطلب ${order.orderNumber} بواسطة المسئول`,
    },
  });

  return NextResponse.json({
    success: true,
    order: updatedOrder,
    amountCollected,
  });
}
