import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

function parseCsv(text: string): string[][] {
  // إزالة BOM إن وجدت
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells;
  });
}

// POST /api/admin/import/products — body: { csv: string }
// الأعمدة المتوقعة: sku,name,slug,price,oldPrice,stock,category,brand
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const { csv } = await req.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "ملف CSV غير صالح" }, { status: 400 });
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return NextResponse.json({ error: "الملف فارغ أو لا يحتوي على بيانات" }, { status: 400 });
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const skuIdx = idx("sku");
  const nameIdx = idx("name");
  const priceIdx = idx("price");

  if (skuIdx === -1 || nameIdx === -1 || priceIdx === -1) {
    return NextResponse.json(
      { error: "الأعمدة المطلوبة (sku, name, price) غير موجودة في الملف" },
      { status: 400 }
    );
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    try {
      const sku = row[skuIdx]?.trim();
      const name = row[nameIdx]?.trim();
      const price = parseFloat(row[priceIdx]);

      if (!sku || !name || isNaN(price)) {
        errors.push(`السطر ${i + 1}: بيانات ناقصة أو غير صحيحة`);
        continue;
      }

      const slugIdx = idx("slug");
      const oldPriceIdx = idx("oldprice");
      const stockIdx = idx("stock");
      const categoryIdx = idx("category");

      const slug = (slugIdx !== -1 && row[slugIdx]?.trim()) || `${sku}-${name}`.toLowerCase().replace(/\s+/g, "-");
      const oldPrice = oldPriceIdx !== -1 && row[oldPriceIdx] ? parseFloat(row[oldPriceIdx]) : undefined;
      const stock = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx]) : 0;

      let categoryId: string | undefined;
      if (categoryIdx !== -1 && row[categoryIdx]?.trim()) {
        const categoryName = row[categoryIdx].trim();
        const category = await prisma.category.findFirst({ where: { name: categoryName } });
        categoryId = category?.id;
      }

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        await prisma.product.update({
          where: { sku },
          data: { name, price, oldPrice, stock, categoryId },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: { sku, name, slug, price, oldPrice, stock, categoryId, status: "DRAFT" },
        });
        created++;
      }
    } catch (err: any) {
      errors.push(`السطر ${i + 1}: ${err.message || "خطأ غير متوقع"}`);
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "products_imported",
      details: `تم استيراد ${created} منتج جديد وتحديث ${updated} منتج`,
    },
  });

  return NextResponse.json({ created, updated, errors });
}
