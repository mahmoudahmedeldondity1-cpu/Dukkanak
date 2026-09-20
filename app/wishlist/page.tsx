import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
  });

  const items = wishlist?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">المفضلة</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">المفضلة فارغة</p>
          <Link href="/products" className="btn-primary">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product.id,
                slug: item.product.slug,
                name: item.product.name,
                price: Number(item.product.price),
                oldPrice: item.product.oldPrice ? Number(item.product.oldPrice) : null,
                image: item.product.images[0]?.url || "/placeholder-product.png",
                ratingAvg: item.product.ratingAvg,
                ratingCount: item.product.ratingCount,
                stock: item.product.stock,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
