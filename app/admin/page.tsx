import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalOrders, pendingOrders, totalProducts, lowStock, outOfStock, revenueAgg, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: { in: ["PAID", "COD"] } } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    ]);

  const revenue = Number(revenueAgg._sum.total || 0);
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">نظرة عامة</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي الإيرادات" value={formatEGP(revenue)} />
        <StatCard label="إجمالي الطلبات" value={String(totalOrders)} />
        <StatCard label="طلبات قيد الانتظار" value={String(pendingOrders)} highlight={pendingOrders > 0} />
        <StatCard label="متوسط قيمة الطلب" value={formatEGP(avgOrderValue)} />
        <StatCard label="عدد المنتجات" value={String(totalProducts)} />
        <StatCard label="مخزون منخفض" value={String(lowStock)} highlight={lowStock > 0} />
        <StatCard label="غير متوفر" value={String(outOfStock)} highlight={outOfStock > 0} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">أحدث الطلبات</h2>
        <Link href="/admin/orders" className="text-sm text-brand-600">عرض الكل ←</Link>
      </div>
      <div className="card divide-y divide-gray-100">
        {recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">لا توجد طلبات بعد</p>
        ) : (
          recentOrders.map((o) => (
            <div key={o.id} className="p-4 flex justify-between items-center text-sm">
              <span className="font-mono">{o.orderNumber}</span>
              <span className="text-gray-500">{o.items.length} منتج</span>
              <span className="font-semibold">{formatEGP(o.total)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? "border-brand-300 bg-brand-50" : ""}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
