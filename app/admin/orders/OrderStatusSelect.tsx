"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "CONFIRMED", label: "تم التأكيد" },
  { value: "SENT_TO_SUPPLIER", label: "أُرسل للمورد (دروب شيب)" },
  { value: "SUPPLIER_PROCESSING", label: "تجهيز المورد" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "PACKED", label: "تم التغليف" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "OUT_FOR_DELIVERY", label: "في الطريق إليك" },
  { value: "DELIVERED", label: "تم التوصيل" },
  { value: "CANCELLED", label: "ملغي" },
  { value: "RETURNED", label: "مرتجع" },
  { value: "REFUNDED", label: "تم الاسترداد" },
];

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);

  async function handleCollectCOD() {
    if (!confirm("تأكيد استلام وتحصيل مبلغ الدفع عند الاستلام من شركة الشحن؟")) return;
    setCollecting(true);
    await fetch(`/api/admin/orders/${orderId}/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setCollecting(false);
    router.refresh();
  }

  async function handleChange(newStatus: string) {
    setLoading(true);
    // Never auto-mark COD orders as PAID on delivery. Collection confirmation must remain independent.
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={loading || collecting}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs border border-gray-300 rounded-md px-2 py-1"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleCollectCOD}
        disabled={loading || collecting}
        className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium"
      >
        {collecting ? "جاري..." : "تأكيد التحصيل (COD)"}
      </button>
    </div>
  );
}
