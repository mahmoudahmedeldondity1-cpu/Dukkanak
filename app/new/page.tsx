import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function NewArrivalsPage() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", isNew: true },
    include: { images: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const cards = products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images[0]?.url || "/placeholder-product.png",
    ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, stock: p.stock, isNew: true,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">وصل حديثًا</h1>
      <p className="text-gray-500 mb-6">أحدث المنتجات المضافة للمتجر</p>

      {cards.length === 0 ? (
        <div className="text-center py-16 text-gray-500">لا توجد منتجات جديدة حاليًا</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
