import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

const actionLabels: Record<string, string> = {
  product_created: "إنشاء منتج",
  product_edited: "تعديل منتج",
  product_deleted: "حذف منتج",
  order_status_changed: "تغيير حالة طلب",
  products_imported: "استيراد منتجات",
  admin_login: "دخول أدمن",
  settings_changed: "تعديل الإعدادات",
};

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">سجل العمليات</h1>
      <div className="card divide-y divide-gray-100">
        {logs.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">لا توجد عمليات مسجلة بعد</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                <span className="text-gray-400 text-xs">{formatDate(log.createdAt)}</span>
              </div>
              {log.details && <p className="text-gray-500 mt-1">{log.details}</p>}
              {log.user && <p className="text-xs text-gray-400 mt-1">بواسطة: {log.user.name}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
