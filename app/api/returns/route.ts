import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

const createReturnSchema = z.object({
  orderId: z.string().min(1, "رقم الطلب مطلوب"),
  reason: z.enum([
    "DAMAGED_PRODUCT",
    "WRONG_ITEM",
    "DEFECTIVE",
    "NOT_AS_DESCRIBED",
    "CHANGED_MIND",
    "OTHER",
  ]),
  description: z.string().optional(),
});

// GET /api/returns — list return requests (user's own or all for admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const isAdmin = isAdminRole((session.user as any)?.role);
  const where = isAdmin ? {} : { userId: (session.user as any).id };

  const returns = await prisma.returnRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json({ returns });
}

// POST /api/returns — create a return or cancellation request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = createReturnSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
  });

  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "الطلب غير موجود أو غير تابع لك" }, { status: 404 });
  }

  // Fetch configured return window days from store settings
  const returnWindowSetting = await prisma.setting.findUnique({
    where: { key: "return_window_days" },
  });
  const returnWindowDays = Math.max(1, Number(returnWindowSetting?.value) || 14);

  // If order is delivered, verify delivery elapsed time is within configured return window
  if (order.status === "DELIVERED") {
    const elapsedDays = (Date.now() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (elapsedDays > returnWindowDays) {
      return NextResponse.json(
        { error: `انتهت الفترة المسموحة للاسترجاع (${returnWindowDays} يومًا من تاريخ التوصيل)` },
        { status: 400 }
      );
    }
  } else if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return NextResponse.json({ error: "الطلب ملغي أو مسترد بالفعل" }, { status: 400 });
  }

  // Check if a pending return request already exists
  const existing = await prisma.returnRequest.findFirst({
    where: {
      orderId: order.id,
      status: { in: ["REQUESTED", "APPROVED"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "يوجد طلب استرجاع/إلغاء قيد المراجعة بالفعل لهذا الطلب" },
      { status: 400 }
    );
  }

  const returnReq = await prisma.returnRequest.create({
    data: {
      orderId: order.id,
      userId,
      reason: parsed.data.reason,
      description: parsed.data.description || null,
      refundAmount: order.total,
      status: "REQUESTED",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "request_order_return",
      details: `طلب استرجاع/إلغاء جديد للطلب ${order.orderNumber}`,
    },
  });

  return NextResponse.json({ returnRequest: returnReq }, { status: 201 });
}
