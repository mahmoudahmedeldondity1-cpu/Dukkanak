import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">حسابي</h1>

      <div className="card p-5 mb-6">
        <p className="font-medium">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className="text-sm text-gray-500">{user?.phone}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/account/orders" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">طلباتي</h3>
          <p className="text-sm text-gray-500 mt-1">{user?._count.orders} طلب</p>
        </Link>
        <Link href="/wishlist" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">المفضلة</h3>
        </Link>
      </div>

      {(session.user as any)?.role === "ADMIN" && (
        <Link href="/admin" className="btn-secondary mt-6 inline-block">لوحة تحكم الأدمن</Link>
      )}
    </div>
  );
}
