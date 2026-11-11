import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

// Strict allowlist for administrative settings to prevent unauthorized arbitrary keys
const ALLOWED_SETTING_KEYS = new Set([
  "store_name",
  "store_phone",
  "store_email",
  "free_shipping_threshold",
  "default_shipping_fee",
  "return_window_days",
  "courier_cost_per_order",
  "maintenance_mode",
  "shipping_rates_json",
]);

const DEFAULTS: Record<string, string> = {
  store_name: "دُكَّانَكْ",
  store_phone: "",
  store_email: "",
  free_shipping_threshold: "1000",
  default_shipping_fee: "60",
  return_window_days: "14",
  courier_cost_per_order: "45",
  maintenance_mode: "false",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const s of settings) {
    if (ALLOWED_SETTING_KEYS.has(s.key)) {
      map[s.key] = s.value;
    }
  }
  return NextResponse.json({ settings: map });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const updates = await req.json();
  if (typeof updates !== "object" || updates === null || Array.isArray(updates)) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_SETTING_KEYS.has(key)) {
      return NextResponse.json({ error: `إعداد غير مسموح بتعديله: ${key}` }, { status: 400 });
    }

    // Validation for numeric settings
    if (
      key === "free_shipping_threshold" ||
      key === "default_shipping_fee" ||
      key === "return_window_days" ||
      key === "courier_cost_per_order"
    ) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || !isFinite(num) || num > 1000000) {
        return NextResponse.json(
          { error: `قيمة رقمية غير صالحة للحقل: ${key}` },
          { status: 400 }
        );
      }
      sanitized[key] = String(Math.round(num));
    } else if (key === "maintenance_mode") {
      sanitized[key] = value === "true" || value === true ? "true" : "false";
    } else {
      sanitized[key] = String(value).slice(0, 500);
    }
  }

  for (const [key, value] of Object.entries(sanitized)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "settings_changed",
      details: `تم تعديل إعدادات المتجر: ${Object.keys(sanitized).join(", ")}`,
    },
  });

  return NextResponse.json({ success: true, settings: sanitized });
}
