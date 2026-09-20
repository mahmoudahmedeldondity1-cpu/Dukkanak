import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول لإضافة تقييم" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات التقييم غير صحيحة" }, { status: 400 });
  }
  const { productId, rating, title, comment } = parsed.data;
  const userId = (session.user as any).id;

  // Verified purchase check: did this user actually order this product?
  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: { not: "CANCELLED" } } },
  });

  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      title,
      comment,
      verifiedPurchase: !!purchased,
      approved: false, // Requires admin moderation before showing publicly
    },
  });

  return NextResponse.json({
    review,
    message: "شكرًا لتقييمك! سيظهر بعد مراجعته من فريقنا.",
  }, { status: 201 });
}

// PATCH /api/reviews — admin moderation (approve/hide)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const { reviewId, approved } = await req.json();
  const review = await prisma.review.update({ where: { id: reviewId }, data: { approved } });

  // Recalculate product rating average from approved reviews
  const agg = await prisma.review.aggregate({
    where: { productId: review.productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: { ratingAvg: agg._avg.rating || 0, ratingCount: agg._count },
  });

  return NextResponse.json({ review });
}
