import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const subtotal = parseFloat(req.nextUrl.searchParams.get("subtotal") || "0");

  if (!code) return NextResponse.json({ error: "أدخل كود الخصم" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "الكوبون غير صالح" }, { status: 404 });
  }
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    return NextResponse.json({ error: "الكوبون لم يبدأ بعد" }, { status: 400 });
  }
  if (coupon.endDate && now > coupon.endDate) {
    return NextResponse.json({ error: "انتهت صلاحية الكوبون" }, { status: 400 });
  }
  if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
    return NextResponse.json(
      { error: `الحد الأدنى للطلب ${coupon.minOrder} جنيه لاستخدام هذا الكوبون` },
      { status: 400 }
    );
  }

  let discount =
    coupon.discountType === "PERCENTAGE" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);

  if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  discount = Math.min(discount, subtotal);

  return NextResponse.json({ discount, code: coupon.code });
}
