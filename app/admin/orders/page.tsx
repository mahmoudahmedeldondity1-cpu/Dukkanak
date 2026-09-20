import { prisma } from "@/lib/prisma";
import { formatEGP, formatDate } from "@/lib/format";
import OrderStatusSelect from "./OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true, user: { select: { name: true, phone: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <a href="/api/admin/export/orders" className="btn-secondary text-sm">تصدير CSV</a>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-right p-3">رقم الطلب</th>
              <th className="text-right p-3">العميل</th>
              <th className="text-right p-3">الإجمالي</th>
              <th className="text-right p-3">الدفع</th>
              <th className="text-right p-3">الحالة</th>
              <th className="text-right p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-3 font-mono">{o.orderNumber}</td>
                <td className="p-3">
                  <div>{o.fullName}</div>
                  <div className="text-xs text-gray-400">{o.phone}</div>
                </td>
                <td className="p-3 font-semibold">{formatEGP(o.total)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${o.paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {o.paymentStatus === "COD" ? "دفع عند الاستلام" : o.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
                <td className="p-3 text-gray-500">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-gray-500 text-sm">لا توجد طلبات بعد</p>}
      </div>
    </div>
  );
}
