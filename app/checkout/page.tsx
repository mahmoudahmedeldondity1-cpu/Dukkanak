"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatEGP } from "@/lib/format";
import { EGYPT_GOVERNORATES } from "@/lib/governorates";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clear);

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    governorate: "", city: "", area: "", street: "",
    buildingNo: "", floor: "", apartment: "", landmark: "",
    paymentMethod: "COD" as "COD" | "CARD" | "WALLET",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const shippingFee = subtotal - discount >= 1000 ? 0 : 60;
  const total = subtotal - discount + shippingFee;

  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="mb-4 text-gray-600">سجّل دخولك الأول عشان تكمل طلبك</p>
        <Link href="/login" className="btn-primary">تسجيل الدخول</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="mb-4 text-gray-600">السلة فارغة</p>
        <Link href="/products" className="btn-primary">تسوق الآن</Link>
      </div>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "الاسم الكامل مطلوب";
    if (!/^01[0-9]{9}$/.test(form.phone.trim())) e.phone = "رقم هاتف مصري غير صحيح (مثال: 01xxxxxxxxx)";
    if (!form.governorate) e.governorate = "اختر المحافظة";
    if (!form.city.trim()) e.city = "المدينة مطلوبة";
    if (!form.area.trim()) e.area = "المنطقة مطلوبة";
    if (!form.street.trim()) e.street = "العنوان بالتفصيل مطلوب";
    if (!agreed) e.agreed = "يجب الموافقة على الشروط والأحكام";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal}`);
    const data = await res.json();
    if (res.ok) setDiscount(data.discount);
    else setDiscount(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        couponCode: discount > 0 ? couponCode : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setSubmitError(data.error || "حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى");
      return;
    }

    clearCart();
    router.push(`/order-confirmation/${data.order.orderNumber}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-4">بيانات التواصل</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <input className="input-field" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني (اختياري)</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">عنوان الشحن</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">المحافظة</label>
                <select className="input-field" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                  <option value="">اختر المحافظة</option>
                  {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.governorate && <p className="text-xs text-red-600 mt-1">{errors.governorate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدينة</label>
                <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المنطقة</label>
                <input className="input-field" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان بالتفصيل</label>
                <input className="input-field" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                {errors.street && <p className="text-xs text-red-600 mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم المبنى (اختياري)</label>
                <input className="input-field" value={form.buildingNo} onChange={(e) => setForm({ ...form, buildingNo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الدور (اختياري)</label>
                <input className="input-field" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الشقة (اختياري)</label>
                <input className="input-field" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">علامة مميزة (اختياري)</label>
                <input className="input-field" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">طريقة الدفع</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 border border-gray-300 rounded-md p-3 cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                <input type="radio" checked={form.paymentMethod === "COD"} onChange={() => setForm({ ...form, paymentMethod: "COD" })} />
                <span>الدفع عند الاستلام</span>
              </label>
              <label className="flex items-center gap-2 border border-gray-300 rounded-md p-3 cursor-not-allowed opacity-50">
                <input type="radio" disabled />
                <span>الدفع بالبطاقة (قريبًا)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="card p-5 h-fit space-y-4">
          <h3 className="font-bold">ملخص الطلب</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
            {items.map((i) => (
              <div key={`${i.productId}-${i.variantId}`} className="flex justify-between">
                <span className="text-gray-600">{i.name} × {i.quantity}</span>
                <span>{formatEGP(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="كود الخصم" className="input-field" />
            <button type="button" onClick={applyCoupon} className="btn-secondary text-sm shrink-0">تطبيق</button>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">المجموع الفرعي</span><span>{formatEGP(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>الخصم</span><span>−{formatEGP(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">الشحن</span><span>{shippingFee === 0 ? "مجاني" : formatEGP(shippingFee)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>الإجمالي</span><span>{formatEGP(total)}</span></div>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            <span>أوافق على <Link href="/terms" className="text-brand-600">الشروط والأحكام</Link> و<Link href="/return-policy" className="text-brand-600">سياسة الاسترجاع</Link></span>
          </label>
          {errors.agreed && <p className="text-xs text-red-600">{errors.agreed}</p>}

          {submitError && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{submitError}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
        </div>
      </form>
    </div>
  );
}


