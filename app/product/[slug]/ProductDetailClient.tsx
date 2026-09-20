"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEGP } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "./ReviewForm";

export default function ProductDetailClient({ product, related }: { product: any; related: any[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const effectivePrice = Number(product.price) + (selectedVariant ? Number(selectedVariant.priceDiff) : 0);
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const images = product.images.length > 0 ? product.images : [{ url: "/placeholder-product.png" }];

  function handleAddToCart() {
    if (effectiveStock === 0) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      image: images[0].url,
      price: effectivePrice,
      variantName: selectedVariant?.name || null,
      quantity,
      stock: effectiveStock,
    });
    setToast("تمت إضافة المنتج إلى السلة");
    setTimeout(() => setToast(""), 2500);
  }

  function handleWhatsAppOrder() {
    const text = `عايز أطلب: ${product.name}\nالكمية: ${quantity}\nالسعر: ${effectivePrice} جنيه\nالرابط: ${window.location.href}`;
    window.open(`https://wa.me/201206306778?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/">الرئيسية</Link> ← <Link href="/products">المنتجات</Link> ← {product.name}
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <Image src={images[activeImage].url} alt={product.name} fill className="object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 ${
                    activeImage === i ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span>★ {product.ratingAvg.toFixed(1)}</span>
            <span>({product.ratingCount} تقييم)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-2xl font-extrabold text-brand-700">{formatEGP(effectivePrice)}</span>
            {product.oldPrice && Number(product.oldPrice) > effectivePrice && (
              <span className="text-gray-400 line-through">{formatEGP(product.oldPrice)}</span>
            )}
          </div>

          <div className="mt-3">
            {effectiveStock > 0 ? (
              <span className="text-sm text-green-700 font-medium">متوفر ({effectiveStock} قطعة)</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">غير متوفر حاليًا</span>
            )}
          </div>

          {product.shortDesc && <p className="mt-4 text-gray-600">{product.shortDesc}</p>}

          {product.variants?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold mb-2">اختر النوع</h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded-md border text-sm ${
                      selectedVariant?.id === v.id
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-300"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                className="px-3 py-2"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="px-4">{quantity}</span>
              <button
                className="px-3 py-2"
                onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
              >
                +
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={effectiveStock === 0} className="btn-primary flex-1">
              أضف إلى السلة
            </button>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 font-bold"
          >
            اطلب عبر واتساب
          </button>

          {toast && (
            <div className="mt-3 bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">{toast}</div>
          )}

          {product.fullDesc && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-semibold mb-2">تفاصيل المنتج</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.fullDesc}</p>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">تقييمات العملاء ({product.ratingCount})</h3>
          <button onClick={() => setShowReviewForm((v) => !v)} className="btn-secondary text-sm">
            أضف تقييمك
          </button>
        </div>

        {showReviewForm && <ReviewForm productId={product.id} onDone={() => setShowReviewForm(false)} />}

        {product.reviews?.length > 0 ? (
          <div className="space-y-4 mt-4">
            {product.reviews.map((r: any) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{r.user.name}</span>
                  {r.verifiedPurchase && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">مشتري موثّق</span>
                  )}
                  <span className="text-gray-400">★ {r.rating}</span>
                </div>
                {r.title && <p className="font-medium mt-1">{r.title}</p>}
                {r.comment && <p className="text-gray-600 text-sm mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-2">لا توجد تقييمات بعد لهذا المنتج.</p>
        )}
      </section>

      {related?.length > 0 && (
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h3 className="text-lg font-bold mb-4">منتجات ذات صلة</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: Number(p.price),
                  oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                  image: p.images[0]?.url || "/placeholder-product.png",
                  ratingAvg: p.ratingAvg,
                  ratingCount: p.ratingCount,
                  stock: p.stock,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
              }
