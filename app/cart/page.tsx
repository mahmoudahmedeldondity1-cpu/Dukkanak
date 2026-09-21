"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatEGP } from "@/lib/format";
import { useState } from "react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal());

  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const url =
      "/api/coupons/validate?code=" +
      encodeURIComponent(coupon) +
      "&subtotal=" +
      String(subtotal);
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) {
      setDiscount(data.discount);
      setCouponMsg("تم تطبيق الكوبون - خصم " + formatEGP(data.discount));
    } else {
      setDiscount(0);
      setCouponMsg(data.error || "الكوبون غير صالح");
    }
  }

  const shippingFee = subtotal > 0 && subtotal < 1000 ? 60 : 0;
  const total = subtotal - discount + shippingFee;

  function handleWhatsAppOrder() {
    const lines = items.map(function (item) {
      const variant = item.variantName ? " - " + item.variantName : "";
      return (
        "- " +
        item.name +
        variant +
        " x " +
        item.quantity +
        " = " +
        item.price * item.quantity +
        " EGP"
      );
    });
    const text =
      "طلب جديد من دكانك:\n" +
      lines.join("\n") +
      "\n\nالإجمالي: " +
      total +
      " جنيه";
    window.open(
      "https://wa.me/201206306778?text=" + encodeURIComponent(text),
      "_blank"
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-lg text-gray-600 mb-6">السلة فارغة</p>
        <Link href="/products" className="btn-primary">
          تابع التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">السلة</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={String(item.productId) + "-" + String(item.variantId || "none")}
              className="card p-4 flex gap-4"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-50">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                {item.variantName && (
                  <p className="text-xs text-gray-500">{item.variantName}</p>
                )}
                <p className="text-brand-700 font-bold mt-1">{formatEGP(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="px-2.5 py-1"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-sm text-red-600"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 h-fit">
          <h3 className="font-bold mb-4">ملخص الطلب</h3>

          <div className="flex gap-2 mb-4">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="كود الخصم"
              className="input-field"
            />
            <button onClick={applyCoupon} className="btn-secondary text-sm shrink-0">
              تطبيق
            </button>
          </div>
          {couponMsg && <p className="text-xs mb-3 text-gray-600">{couponMsg}</p>}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span>{formatEGP(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>الخصم</span>
                <span>−{formatEGP(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">الشحن</span>
              <span>{shippingFee === 0 ? "مجاني" : formatEGP(shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2">
              <span>الإجمالي</span>
              <span>{formatEGP(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 font-bold"
          >
            اطلب عبر واتساب
          </button>
          <Link href="/checkout" className="btn-primary w-full mt-3 block text-center">
            إتمام الطلب من الموقع
          </Link>
          <Link href="/products" className="block text-center text-sm text-gray-500 mt-3">
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
          }
