"use client";

import Link from "next/link";
import Image from "next/image";
import { formatEGP } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  ratingAvg: number;
  ratingCount: number;
  isNew?: boolean;
  onSale?: boolean;
  stock: number;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="card group relative overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          {discount && (
            <span className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded">
              خصم {discount}%
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-ink text-white text-xs font-bold px-2 py-1 rounded">
              جديد
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">غير متوفر</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <span>★ {product.ratingAvg.toFixed(1)}</span>
            <span>({product.ratingCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-brand-700">{formatEGP(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatEGP(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
