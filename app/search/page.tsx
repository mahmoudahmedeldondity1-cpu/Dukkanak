import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();

  const products = q
    ? await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { shortDesc: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        },
        take: 40,
        include: { images: { take: 1 } },
      })
    : [];

  const cards = products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images[0]?.url || "/placeholder-product.png",
    ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, stock: p.stock,
  }));

  let suggestions: any[] = [];
  let popularCategories: any[] = [];
  if (cards.length === 0 && q) {
    [suggestions, popularCategories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED", isBestSeller: true },
        take: 8,
        include: { images: { take: 1 } },
      }),
      prisma.category.findMany({ where: { active: true }, take: 6 }),
    ]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">
        {q ? `نتائج البحث عن "${q}"` : "ابحث عن منتج"}
      </h1>

      {cards.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{cards.length} نتيجة</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cards.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      ) : q ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">لا توجد نتائج مطابقة لـ "{q}"</p>
          <p className="text-sm text-gray-400 mb-8">جرّب كلمات بحث مختلفة أو تصفح التصنيفات</p>

          {popularCategories.length > 0 && (
            <div className="mb-10">
              <h3 className="font-semibold mb-3">تصنيفات قريبة</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {popularCategories.map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} className="btn-secondary text-sm">{c.name}</Link>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 text-right">منتجات قد تعجبك</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
                {suggestions.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
                      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                      image: p.images[0]?.url || "/placeholder-product.png",
                      ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, stock: p.stock,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <Link href="/products" className="btn-primary inline-block mt-8">تصفح كل المنتجات</Link>
        </div>
      ) : null}
    </div>
  );
}
