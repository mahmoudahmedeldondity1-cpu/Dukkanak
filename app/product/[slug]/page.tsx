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
    include: {
      images: {
        take: 1,
        orderBy: { sortOrder: "asc" },
      },
    },
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

  const product = data.product;

  return {
    title: product.seoTitle || `${product.name} | دُكَّانَكْ`,

    description:
      product.seoDesc ||
      product.shortDesc ||
      `اشترِ ${product.name} من دُكَّانَكْ.`,

    alternates: {
      canonical: `https://dukanak.vercel.app/products/${product.slug}`,
    },

    openGraph: {
      title: product.seoTitle || `${product.name} | دُكَّانَكْ`,
      description:
        product.seoDesc ||
        product.shortDesc ||
        `اشترِ ${product.name} من دُكَّانَكْ.`,
      url: `https://dukanak.vercel.app/products/${product.slug}`,
      siteName: "دُكَّانَكْ",
      locale: "ar_EG",
      type: "website",

      images:
        product.images.length > 0
          ? [
              {
                url: product.images[0].url,
                alt: product.name,
              },
            ]
          : [],
    },

    robots: {
      index: true,
      follow: true,
    },
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

  const { product, related } = data;

  /*
   * Product Schema
   * يجعل Google يفهم أن هذه صفحة منتج حقيقية.
   */

  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description:
      product.seoDesc ||
      product.shortDesc ||
      product.description ||
      undefined,

    url: `https://dukanak.vercel.app/products/${product.slug}`,

    image:
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : ["https://dukanak.vercel.app/placeholder-product.png"],

    brand: {
      "@type": "Brand",
      name: "دُكَّانَكْ",
    },

    sku: product.id,

    offers: {
      "@type": "Offer",

      url: `https://dukanak.vercel.app/products/${product.slug}`,

      priceCurrency: "EGP",

      price: Number(product.price),

      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition: "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: "دُكَّانَكْ",
      },
    },
  };

  /*
   * نضيف التقييمات فقط لو عندنا تقييمات حقيقية معتمدة.
   */
  const approvedReviews = product.reviews.filter(
    (review) =>
      typeof review.rating === "number" &&
      review.rating >= 1 &&
      review.rating <= 5
  );

  if (approvedReviews.length > 0) {
    const totalRating = approvedReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating = totalRating / approvedReviews.length;

    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(averageRating.toFixed(1)),
      reviewCount: approvedReviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const serialized = JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "object" &&
      value?.constructor?.name === "Decimal"
        ? Number(value)
        : value
    )
  );

  return (
    <>
      {/* Product Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <ProductDetailClient
        product={serialized.product}
        related={serialized.related}
      />
    </>
  );
  }
