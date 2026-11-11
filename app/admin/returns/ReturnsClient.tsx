"use client";

import { useState } from "react";
import { formatEGP } from "@/lib/format";

interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  customerName: string;
  customerPhone: string | null;
  reason: string;
  description: string | null;
  status: string;
  refundAmount: number | null;
  adminNotes: string | null;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  DAMAGED_PRODUCT: "تلف أثناء الشحن",
  WRONG_ITEM: "منتج مختلف عن المطلوب",
  DEFECTIVE: "عيب صناعة",
  NOT_AS_DESCRIBED: "غير مطابق للمواصفات",
  CHANGED_MIND: "تراجع عن الشراء",
  OTHER: "سبب آخر",
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "قيد المراجعة",
  APPROVED: "تمت الموافقة",
  REJECTED: "مرفوض",
  ITEM_RECEIVED: "تم استلام المنتج",
  REFUNDED: "تم رد المبلغ",
  COMPLETED: "مكتمل",
};

export default function ReturnsClient({ initialReturns }: { initialReturns: ReturnItem[] }) {
  const [returns, setReturns] = useState<ReturnItem[]>(initialReturns);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReturns(returns.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
          <tr>
            <th className="p-3">رقم الطلب</th>
            <th className="p-3">العميل</th>
            <th className="p-3">السبب</th>
            <th className="p-3">التفاصيل</th>
            <th className="p-3">المبلغ</th>
            <th className="p-3">الحالة</th>
            <th className="p-3">إجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {returns.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">
                لا توجد طلبات استرجاع أو إلغاء مسجلة حاليًا.
              </td>
            </tr>
          ) : (
            returns.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono font-medium">{r.orderNumber}</td>
                <td className="p-3">
                  <div>{r.customerName}</div>
                  <div className="text-xs text-gray-400 font-mono">{r.customerPhone || "—"}</div>
                </td>
                <td className="p-3 text-gray-700">{REASON_LABELS[r.reason] || r.reason}</td>
                <td className="p-3 text-xs text-gray-500 max-w-xs truncate">{r.description || "—"}</td>
                <td className="p-3 font-semibold text-gray-900">
                  {formatEGP(r.refundAmount ?? r.orderTotal)}
                </td>
                <td className="p-3">
                  <span
                    className={`badge text-xs ${
                      r.status === "REQUESTED"
                        ? "bg-amber-50 text-amber-700"
                        : r.status === "APPROVED" || r.status === "REFUNDED"
                        ? "bg-emerald-50 text-emerald-700"
                        : r.status === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    disabled={updatingId === r.id}
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
