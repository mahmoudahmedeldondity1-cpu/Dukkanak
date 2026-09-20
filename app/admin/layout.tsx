import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole((session.user as any)?.role)) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[200px_1fr] gap-8">
      <aside className="space-y-1">
        <h2 className="font-bold mb-3 text-brand-700">لوحة التحكم</h2>
        <Link href="/admin" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm">نظرة عامة</Link>
        <Link href="/admin/products" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm">المنتجات</Link>
        <Link href="/admin/orders" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm">الطلبات</Link>
        <Link href="/admin/settings" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm">الإعدادات</Link>
        <Link href="/admin/audit-log" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm">سجل العمليات</Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
