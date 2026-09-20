import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, bestSellers, newArrivals, onSale] = await Promise.all([
    prisma.category.findMany({ where: { active: true, parentId: null }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isBestSeller: true },
      take: 8,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isNew: true },
      take: 8,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", onSale: true },
      take: 8,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const toCard = (p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images[0]?.url || "/placeholder-product.png",
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    isNew: p.isNew,
    onSale: p.onSale,
    stock: p.stock,
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-l from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-ink">
              كل اللي محتاجه، في دُكَّانَكْ
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              تسوق بثقة — دفع عند الاستلام، وشحن لكل محافظات مصر.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/products" className="btn-primary">تسوق الآن</Link>
              <Link href="/deals" className="btn-secondary">شوف العروض</Link>
            </div>
          </div>
          <div className="aspect-video bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 font-bold text-xl">
            دُكَّانَكْ
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold mb-5">تصفح حسب التصنيف</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="card p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-sm font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* On Sale */}
      {onSale.length > 0 && (
        <ProductSection title="عروض محدودة" products={onSale.map(toCard)} href="/deals" />
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <ProductSection title="الأكثر مبيعًا" products={bestSellers.map(toCard)} href="/products?sort=bestseller" />
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <ProductSection title="وصل حديثًا" products={newArrivals.map(toCard)} href="/new" />
      )}

      {(categories.length === 0 && bestSellers.length === 0 && newArrivals.length === 0) && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
          لسه مفيش منتجات مضافة. أضف منتجات من لوحة التحكم عشان تظهر هنا.
        </div>
      )}
    </div>
  );
}

function ProductSection({ title, products, href }: { title: string; products: any[]; href: string }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="text-sm text-brand-600 font-medium">عرض الكل ←</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
