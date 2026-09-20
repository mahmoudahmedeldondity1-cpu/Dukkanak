import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatEGP, formatDate } from "@/lib/format";

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
  PROCESSING: "قيد التجهيز",
  PACKED: "تم التغليف",
  SHIPPED: "تم الشحن",
  OUT_FOR_DELIVERY: "في الطريق إليك",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
  REFUNDED: "تم الاسترداد",
};

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">لا توجد طلبات بعد</p>
          <Link href="/products" className="btn-primary">تسوق الآن</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.orderNumber}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-gray-500">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded font-medium">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-600">{order.items.length} منتج</span>
                <span className="font-bold">{formatEGP(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
