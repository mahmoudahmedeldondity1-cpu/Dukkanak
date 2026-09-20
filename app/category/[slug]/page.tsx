import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category || !category.active) return null;

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const products = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds }, status: "PUBLISHED" },
    include: { images: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return { category, products };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCategoryData(params.slug);
  if (!data) return {};
  return {
    title: data.category.seoTitle || `${data.category.name} | دُكَّانَكْ`,
    description: data.category.seoDesc || data.category.description || undefined,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await getCategoryData(params.slug);
  if (!data) notFound();

  const { category, products } = data;

  const cards = products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images[0]?.url || "/placeholder-product.png",
    ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, stock: p.stock,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/">الرئيسية</Link> ← {category.name}
      </nav>
      <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
      {category.description && <p className="text-gray-500 mb-6">{category.description}</p>}

      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="btn-secondary text-sm">{c.name}</Link>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">{cards.length} منتج</p>

      {cards.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          لا توجد منتجات في هذا التصنيف حاليًا
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
