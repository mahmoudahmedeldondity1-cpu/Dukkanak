"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SupplierItem {
  id: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  productCount: number;
  createdAt: string;
}

export default function SuppliersClient({ initialSuppliers }: { initialSuppliers: SupplierItem[] }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(initialSuppliers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    notes: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إضافة المورد");

      setSuppliers([
        {
          ...data.supplier,
          productCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...suppliers,
      ]);
      setShowAddModal(false);
      setForm({ name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", notes: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(supplier: SupplierItem) {
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !supplier.active }),
      });
      if (res.ok) {
        setSuppliers(
          suppliers.map((s) => (s.id === supplier.id ? { ...s, active: !s.active } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
          + إضافة مورد جديد
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="p-3">اسم المورد</th>
              <th className="p-3">مسؤول التواصل</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">البريد</th>
              <th className="p-3">المنتجات المرتبطة</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  لا يوجد موردون مسجلون حاليًا. اضغط على زر &quot;إضافة مورد جديد&quot; للبدء.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{s.name}</td>
                  <td className="p-3 text-gray-600">{s.contactName || "—"}</td>
                  <td className="p-3 text-gray-600 font-mono">{s.contactPhone || "—"}</td>
                  <td className="p-3 text-gray-600">{s.contactEmail || "—"}</td>
                  <td className="p-3">
                    <span className="badge bg-blue-50 text-blue-700 font-medium">
                      {s.productCount} منتج
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`badge cursor-pointer ${
                        s.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.active ? "نشط" : "معطل"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(s)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {s.active ? "تعطيل" : "تفعيل"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 text-right">
            <h3 className="text-lg font-bold mb-4">إضافة مورد دروب شيبينج جديد</h3>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  اسم المورد / الشركة *
                </label>
                <input
                  required
                  className="input-field"
                  placeholder="مثال: شركة النصر للتوريدات"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    اسم مسؤول التواصل
                  </label>
                  <input
                    className="input-field"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    className="input-field"
                    placeholder="01xxxxxxxxx"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  العنوان / المقر
                </label>
                <input
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ملاحظات واتفاقيات الأسعار
                </label>
                <textarea
                  rows={2}
                  className="input-field"
                  placeholder="ملاحظات حول سرعة التوريد، أسعار الجملة، شروط الشحن..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-sm"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary text-sm" disabled={loading}>
                  {loading ? "جاري الإضافة..." : "حفظ المورد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
