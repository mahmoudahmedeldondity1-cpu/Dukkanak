import { prisma } from "@/lib/prisma";
import SuppliersClient from "./SuppliersClient";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const serialized = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    contactName: s.contactName,
    contactPhone: s.contactPhone,
    contactEmail: s.contactEmail,
    address: s.address,
    notes: s.notes,
    active: s.active,
    productCount: s._count.products,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة موردي الدروب شيبينج</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة الموردين وربط المنتجات وتكاليف الشراء ومتابعة التوريد
          </p>
        </div>
      </div>

      <SuppliersClient initialSuppliers={serialized} />
    </div>
  );
}
