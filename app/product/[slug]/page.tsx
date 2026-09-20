import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });
  if (!product || product.status !== "PUBLISHED") return null;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId ?? undefined, id: { not: product.id }, status: "PUBLISHED" },
    take: 8,
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return { product, related };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return {};
  return {
    title: data.product.seoTitle || `${data.product.name} | دُكَّانَكْ`,
    description: data.product.seoDesc || data.product.shortDesc || undefined,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();

  const serialized = JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === "object" && value?.constructor?.name === "Decimal" ? Number(value) : value))
  );

  return <ProductDetailClient product={serialized.product} related={serialized.related} />;
}
