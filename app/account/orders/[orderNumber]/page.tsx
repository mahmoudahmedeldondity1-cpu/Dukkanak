import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEGP, formatDate } from "@/lib/format";

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار", CONFIRMED: "تم التأكيد", PROCESSING: "قيد التجهيز",
  PACKED: "تم التغليف", SHIPPED: "تم الشحن", OUT_FOR_DELIVERY: "في الطريق إليك",
  DELIVERED: "تم التوصيل", CANCELLED: "ملغي", RETURNED: "مرتجع", REFUNDED: "تم الاسترداد",
};

export default async function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, address: true },
  });

  if (!order) notFound();

  const isAdmin = isAdminRole((session.user as any)?.role);
  if (!isAdmin && order.userId !== (session.user as any).id) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-mono">{order.orderNumber}</h1>
        <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded font-medium">
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-3">المنتجات</h3>
        <div className="space-y-2 text-sm mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-gray-600">{item.nameSnapshot} × {item.quantity}</span>
              <span>{formatEGP(Number(item.priceSnapshot) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">المجموع الفرعي</span><span>{formatEGP(order.subtotal)}</span></div>
          {Number(order.discount) > 0 && <div className="flex justify-between text-green-700"><span>الخصم</span><span>−{formatEGP(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">الشحن</span><span>{Number(order.shippingFee) === 0 ? "مجاني" : formatEGP(order.shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>الإجمالي</span><span>{formatEGP(order.total)}</span></div>
        </div>
      </div>

      <div className="card p-5 mt-4 text-sm text-gray-600 space-y-1">
        <h3 className="font-semibold text-ink mb-2">عنوان الشحن</h3>
        <p>{order.fullName} — {order.phone}</p>
        <p>{order.address?.governorate} - {order.address?.city} - {order.address?.area} - {order.address?.street}</p>
        {order.trackingNumber && <p className="mt-2">رقم التتبع: <span className="font-mono">{order.trackingNumber}</span></p>}
        <p className="mt-2">تاريخ الطلب: {formatDate(order.createdAt)}</p>
        <p>طريقة الدفع: {order.paymentMethod === "COD" ? "الدفع عند الاستلام" : order.paymentMethod}</p>
      </div>
    </div>
  );
}
