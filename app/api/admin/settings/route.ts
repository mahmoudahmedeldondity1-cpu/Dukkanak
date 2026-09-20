import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";

const DEFAULTS: Record<string, string> = {
  store_name: "دُكَّانَكْ",
  store_phone: "",
  store_email: "",
  free_shipping_threshold: "1000",
  default_shipping_fee: "60",
  maintenance_mode: "false",
};

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ settings: map });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const updates: Record<string, string> = await req.json();

  for (const [key, value] of Object.entries(updates)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "settings_changed",
      details: `تم تعديل إعدادات المتجر: ${Object.keys(updates).join(", ")}`,
    },
  });

  return NextResponse.json({ success: true });
}
