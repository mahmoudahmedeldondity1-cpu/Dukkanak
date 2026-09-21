"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    sku: "", name: "", slug: "", price: "", oldPrice: "", stock: "",
    shortDesc: "", fullDesc: "", imageUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function slugify(sku: string) {
    return sku.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        slug: form.slug || slugify(form.sku),
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        stock: parseInt(form.stock || "0"),
        shortDesc: form.shortDesc,
        fullDesc: form.fullDesc,
        images: form.imageUrl ? [form.imageUrl] : [],
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المنتج</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر</label>
            <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر قبل الخصم (اختياري)</label>
            <input type="number" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكمية بالمخزون</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رابط صورة (اختياري)</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">وصف مختصر</label>
          <input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">وصف كامل</label>
          <textarea value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} className="input-field" rows={4} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "جاري الحفظ..." : "حفظ كمسودة"}
        </button>
        <p className="text-xs text-gray-500">يمكنك نشر المنتج بعد الحفظ من صفحة المنتجات.</p>
      </form>
    </div>
  );
}
