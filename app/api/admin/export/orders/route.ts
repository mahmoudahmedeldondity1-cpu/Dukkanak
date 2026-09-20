import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { error: "غير مصرح لك بهذا الإجراء" },
      { status: 403 }
    );
  }

  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const headers = [
    "orderNumber",
    "customerName",
    "phone",
    "total",
    "paymentMethod",
    "paymentStatus",
    "status",
    "itemsCount",
    "createdAt",
  ];

  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.fullName,
      order.phone,
      order.total.toString(),
      order.paymentMethod,
      order.paymentStatus,
      order.status,
      order.items.length,
      formatDate(order.createdAt),
    ]
      .map(toCsvValue)
      .join(",")
  );

  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dukkanak-orders-${Date.now()}.csv"`,
    },
  });
}
