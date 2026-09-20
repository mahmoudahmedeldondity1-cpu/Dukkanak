import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatEGP, formatDate } from "@/lib/format";

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
};

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, address: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold">تم تأكيد طلبك بنجاح</h1>
      <p className="text-gray-500 mt-2">رقم الطلب: <span className="font-mono font-semibold">{order.orderNumber}</span></p>

      <div className="card p-5 text-right mt-8">
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
        <div className="border-t border-gray-100 mt-4 pt-4 text-sm text-gray-600 space-y-1">
          <p>العنوان: {order.address?.governorate} - {order.address?.city} - {order.address?.area} - {order.address?.street}</p>
          <p>طريقة الدفع: {order.paymentMethod === "COD" ? "الدفع عند الاستلام" : order.paymentMethod}</p>
          <p>تاريخ الطلب: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-8">
        <Link href={`/account/orders/${order.orderNumber}`} className="btn-secondary">عرض الطلب</Link>
        <Link href="/products" className="btn-primary">متابعة التسوق</Link>
      </div>
    </div>
  );
}
