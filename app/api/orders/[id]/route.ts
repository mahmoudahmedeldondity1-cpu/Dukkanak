import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: { items: true, address: true },
  });

  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const isAdmin = isAdminRole((session.user as any)?.role);
  if (!isAdmin && order.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "غير مصرح لك بعرض هذا الطلب" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields: any = {};
  if (body.status) allowedFields.status = body.status;
  if (body.paymentStatus) allowedFields.paymentStatus = body.paymentStatus;
  if (body.trackingNumber !== undefined) allowedFields.trackingNumber = body.trackingNumber;

  const order = await prisma.order.update({ where: { id: params.id }, data: allowedFields });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "order_status_changed",
      details: `تم تحديث حالة الطلب ${order.orderNumber} إلى ${order.status}`,
    },
  });

  return NextResponse.json({ order });
}
