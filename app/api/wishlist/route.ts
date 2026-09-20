import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: { include: { images: { take: 1 }, } } } } },
  });

  return NextResponse.json({ items: wishlist?.items || [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const { productId } = await req.json();
  const userId = (session.user as any).id;

  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId } });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ added: false });
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  return NextResponse.json({ added: true });
}
