import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatEGP } from "@/lib/format";
import ProductRowActions from "./ProductRowActions";
import ProductsCsvTools from "./ProductsCsvTools";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";

  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { images: { take: 1 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">+ إضافة منتج</Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <form>
          <input name="q" defaultValue={q} placeholder="ابحث بالاسم أو SKU..." className="input-field max-w-sm" />
        </form>
        <ProductsCsvTools />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-right p-3">المنتج</th>
              <th className="text-right p-3">السعر</th>
              <th className="text-right p-3">المخزون</th>
              <th className="text-right p-3">الحالة</th>
              <th className="text-right p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.sku}</div>
                </td>
                <td className="p-3">{formatEGP(p.price)}</td>
                <td className="p-3">
                  <span className={p.stock === 0 ? "text-red-600" : p.stock <= p.lowStockAlert ? "text-amber-600" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${p.status === "PUBLISHED" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.status === "PUBLISHED" ? "منشور" : p.status === "DRAFT" ? "مسودة" : "مؤرشف"}
                  </span>
                </td>
                <td className="p-3">
                  <ProductRowActions slug={p.slug} status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-gray-500 text-sm">لا توجد منتجات</p>}
      </div>
    </div>
  );
}
