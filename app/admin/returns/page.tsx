import { prisma } from "@/lib/prisma";
import ReturnsClient from "./ReturnsClient";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
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

  const serialized = returns.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderNumber: r.order.orderNumber,
    orderTotal: Number(r.order.total),
    customerName: r.user.name,
    customerPhone: r.user.phone,
    reason: r.reason,
    description: r.description,
    status: r.status,
    refundAmount: r.refundAmount ? Number(r.refundAmount) : null,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">طلبات الاسترجاع والإلغاء</h1>
        <p className="text-sm text-gray-500 mt-1">
          متابعة طلبات استرجاع المنتجات والشكاوى وإدارة الاسترداد المالي
        </p>
      </div>

      <ReturnsClient initialReturns={serialized} />
    </div>
  );
}
