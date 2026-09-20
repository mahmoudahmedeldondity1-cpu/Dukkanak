"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "CONFIRMED", label: "تم التأكيد" },
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

  async function handleChange(newStatus: string) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs border border-gray-300 rounded-md px-2 py-1"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
