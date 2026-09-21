import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function cleanSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

async function getProduct(rawSlug: string) {
  const slug = cleanSlug(rawSlug);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!product || product.status !== "PUBLISHED") return null;

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId ?? undefined,
      id: { not: product.id },
      status: "PUBLISHED",
    },
    take: 8,
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return { product, related };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const data = await getProduct(slug);
  if (!data) return {};
  return {
    title: data.product.seoTitle || `${data.product.name} | دُكَّانَكْ`,
    description: data.product.seoDesc || data.product.shortDesc || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await Promise.resolve(params);
  const data = await getProduct(slug);
  if (!data) notFound();

  const serialized = JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "object" && value?.constructor?.name === "Decimal"
        ? Number(value)
        : value
    )
  );

  return (
    <ProductDetailClient
      product={serialized.product}
      related={serialized.related}
    />
  );
}
