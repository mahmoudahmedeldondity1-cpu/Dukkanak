import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/format";
import { z } from "zod";

const orderSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  email: z.string().email().optional().or(z.literal("")),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  area: z.string().min(1, "المنطقة مطلوبة"),
  street: z.string().min(1, "العنوان مطلوب"),
  buildingNo: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  paymentMethod: z.enum(["COD", "CARD", "WALLET"]),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "السلة فارغة"),
});

// GET /api/orders — orders of the logged-in user, or all orders for admin
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const isAdmin = isAdminRole((session.user as any)?.role);
  const sp = req.nextUrl.searchParams;

  const where: any = isAdmin ? {} : { userId: (session.user as any).id };
  const status = sp.get("status");
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true, user: isAdmin ? { select: { name: true, email: true, phone: true } } : false },
    take: 100,
  });

  return NextResponse.json({ orders });
}

// POST /api/orders — create a real order, validate + decrement stock atomically
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول لإتمام الطلب" }, { status: 401 });

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const userId = (session.user as any).id;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock and fetch prices from DB (never trust client-sent prices)
      let subtotal = 0;
      const itemsData = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.status !== "PUBLISHED") {
          throw new Error(`المنتج غير متوفر`);
        }

        let stock = product.stock;
        let price = Number(product.price);
        let variant = null;

        if (item.variantId) {
          variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant) throw new Error("النوع المختار غير موجود");
          stock = variant.stock;
          price += Number(variant.priceDiff);
        }

        if (stock < item.quantity) {
          throw new Error(`الكمية المطلوبة من "${product.name}" غير متوفرة في المخزون`);
        }

        subtotal += price * item.quantity;
        itemsData.push({
          productId: product.id,
          variantId: item.variantId || null,
          nameSnapshot: product.name + (variant ? ` - ${variant.name}` : ""),
          priceSnapshot: price,
          quantity: item.quantity,
        });

        // Decrement stock
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          });
        }

        await tx.inventoryLog.create({
          data: { productId: product.id, change: -item.quantity, reason: "طلب جديد" },
        });
      }

      // Coupon
      let discount = 0;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
        if (coupon && coupon.active) {
          discount =
            coupon.discountType === "PERCENTAGE"
              ? (subtotal * Number(coupon.value)) / 100
              : Number(coupon.value);
          if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
          discount = Math.min(discount, subtotal);
        }
      }

      const shippingFee = subtotal - discount >= 1000 ? 0 : 60;
      const total = subtotal - discount + shippingFee;

      // Create address record
      const address = await tx.address.create({
        data: {
          userId,
          fullName: data.fullName,
          phone: data.phone,
          governorate: data.governorate,
          city: data.city,
          area: data.area,
          street: data.street,
          buildingNo: data.buildingNo,
          floor: data.floor,
          apartment: data.apartment,
          landmark: data.landmark,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: address.id,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || null,
          subtotal,
          discount,
          shippingFee,
          total,
          couponCode: data.couponCode || null,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === "COD" ? "COD" : "PENDING",
          status: "PENDING",
          items: { create: itemsData },
        },
        include: { items: true },
      });

      // Clear the user's saved cart (if any)
      await tx.cartItem.deleteMany({ where: { cart: { userId } } });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء إنشاء الطلب" }, { status: 400 });
  }
}
