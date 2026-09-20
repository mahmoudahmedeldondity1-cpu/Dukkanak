"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  }

  const cards = items.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images?.[0]?.url || "/placeholder-product.png",
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    isNew: p.isNew,
    stock: p.stock,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">جميع المنتجات</h1>
        <button className="md:hidden btn-secondary text-sm" onClick={() => setFiltersOpen(true)}>
          الفلاتر
        </button>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden md:block">
          <FilterPanel minPrice={minPrice} maxPrice={maxPrice} onApply={updateParam} />
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{total} منتج</span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="input-field !w-auto"
            >
              <option value="">الأكثر صلة</option>
              <option value="newest">الأحدث</option>
              <option value="price_asc">الأقل سعرًا</option>
              <option value="price_desc">الأعلى سعرًا</option>
              <option value="rating">الأعلى تقييمًا</option>
              <option value="bestseller">الأكثر مبيعًا</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="mb-4">لا توجد منتجات مطابقة</p>
              <button onClick={() => router.push("/products")} className="btn-secondary">
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">الفلاتر</h3>
              <button onClick={() => setFiltersOpen(false)}>إغلاق</button>
            </div>
            <FilterPanel
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={(k, v) => {
                updateParam(k, v);
                setFiltersOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (key: string, value: string) => void;
}) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-2">السعر</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="من"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="إلى"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          className="btn-secondary w-full mt-2 text-sm"
          onClick={() => {
            onApply("minPrice", min);
            onApply("maxPrice", max);
          }}
        >
          تطبيق
        </button>
      </div>
    </div>
  );
}
