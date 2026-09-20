import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

function toCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "sku", "name", "slug", "price", "oldPrice", "stock", "category", "brand", "status", "isFeatured", "isNew", "isBestSeller", "onSale",
  ];

  const rows = products.map((p) =>
    [
      p.sku, p.name, p.slug, p.price.toString(), p.oldPrice?.toString() || "",
      p.stock, p.category?.name || "", p.brand?.name || "", p.status,
      p.isFeatured, p.isNew, p.isBestSeller, p.onSale,
    ].map(toCsvValue).join(",")
  );

  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // BOM لدعم العربية في Excel

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dukkanak-products-${Date.now()}.csv"`,
    },
  });
}
