"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderReturnButton({
  orderId,
  hasExistingRequest,
}: {
  orderId: string;
  hasExistingRequest: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("DEFECTIVE");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(hasExistingRequest);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إرسال الطلب");

      setSuccess(true);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card p-4 mt-4 bg-amber-50 border-amber-200 text-amber-800 text-sm">
        <p className="font-semibold">طلب الاسترجاع / الإلغاء قيد المراجعة</p>
        <p className="text-xs mt-1 text-amber-700">
          سيقوم فريق خدمة العملاء بالتواصل معك لمتابعة فحص المنتج واسترداد المبلغ.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm w-full !text-red-600 hover:!bg-red-50"
      >
        طلب استرجاع أو إلغاء الطلب
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-right">
            <h3 className="text-lg font-bold mb-3">طلب استرجاع / إلغاء</h3>
            <p className="text-xs text-gray-500 mb-4">
              يمكنك تقديم طلب استرجاع أو استبدال للمنتجات في حال وجود عيب صناعة، تلف أثناء الشحن، أو عدم مطابقة للمواصفات طبقًا لسياسة المتجر المعتمدة.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  سبب الاسترجاع أو الإلغاء *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="DEFECTIVE">وجود عيب صناعة في المنتج</option>
                  <option value="DAMAGED_PRODUCT">تلف أو كسر أثناء الشحن</option>
                  <option value="WRONG_ITEM">استلام منتج مختلف عن المطلوب</option>
                  <option value="NOT_AS_DESCRIBED">المنتج غير مطابق للمواصفات المعروضة</option>
                  <option value="CHANGED_MIND">تراجع عن الشراء قبل الشحن</option>
                  <option value="OTHER">سبب آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  تفاصيل المشكلة
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="يرجى توضيح سبب المشكلة لتسريع إجراءات الاسترجاع..."
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-sm"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button type="submit" disabled={loading} className="btn-primary text-sm">
                  {loading ? "جاري الإرسال..." : "إرسال طلب الاسترجاع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
