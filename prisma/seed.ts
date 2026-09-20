import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 جاري إضافة بيانات تجريبية...");

  // مستخدم أدمن
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@dukkanak.com" },
    update: {},
    create: {
      name: "مدير المتجر",
      email: "admin@dukkanak.com",
      phone: "01000000000",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  // تصنيفات
  const categoriesData = [
    { name: "إلكترونيات", slug: "electronics" },
    { name: "أزياء رجالي", slug: "men-fashion" },
    { name: "أزياء حريمي", slug: "women-fashion" },
    { name: "المنزل والمطبخ", slug: "home-kitchen" },
    { name: "الجمال والعناية", slug: "beauty" },
    { name: "ألعاب أطفال", slug: "toys" },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories.push(cat);
  }

  // منتجات تجريبية
  const productNames = [
    "سماعة بلوتوث لاسلكية",
    "ساعة ذكية رياضية",
    "قميص قطن رجالي",
    "فستان صيفي",
    "طقم أواني طبخ",
    "كريم مرطب للوجه",
    "لعبة تركيب مكعبات",
    "شاحن سريع متعدد المنافذ",
    "حذاء رياضي رجالي",
    "حقيبة يد نسائية",
    "خلاط كهربائي",
    "عطر رجالي فاخر",
    "دراجة أطفال",
    "لابتوب ستاند",
    "بطانية شتوية ناعمة",
    "نظارة شمسية",
    "طاولة قهوة خشبية",
    "سيروم فيتامين سي",
    "بازل خشبي تعليمي",
    "سماعة رأس للألعاب",
  ];

  for (let i = 0; i < productNames.length; i++) {
    const name = productNames[i];
    const category = categories[i % categories.length];
    const price = 150 + Math.floor(Math.random() * 2000);
    const hasDiscount = Math.random() > 0.5;
    const slug = `product-${i + 1}-${name.replace(/\s+/g, "-")}`;

    await prisma.product.upsert({
      where: { sku: `SKU-${1000 + i}` },
      update: {},
      create: {
        sku: `SKU-${1000 + i}`,
        name,
        slug,
        shortDesc: `${name} بجودة ممتازة وسعر مناسب.`,
        fullDesc: `${name} — منتج أصلي مضمون الجودة، مناسب للاستخدام اليومي. متوفر بكميات محدودة.`,
        price,
        oldPrice: hasDiscount ? Math.round(price * 1.3) : null,
        stock: Math.floor(Math.random() * 40),
        categoryId: category.id,
        status: "PUBLISHED",
        isFeatured: i % 5 === 0,
        isNew: i % 3 === 0,
        isBestSeller: i % 4 === 0,
        onSale: hasDiscount,
        ratingAvg: 3.5 + Math.random() * 1.5,
        ratingCount: Math.floor(Math.random() * 200),
        images: {
          create: [{ url: `https://picsum.photos/seed/dukkanak${i}/600/600`, sortOrder: 0 }],
        },
      },
    });
  }

  // كوبون تجريبي
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      value: 10,
      minOrder: 200,
      active: true,
    },
  });

  console.log("✅ تم إضافة البيانات التجريبية بنجاح");
  console.log("بيانات دخول الأدمن: admin@dukkanak.com / Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
