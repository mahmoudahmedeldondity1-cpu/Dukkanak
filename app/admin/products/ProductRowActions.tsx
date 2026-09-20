"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductRowActions({ slug, status }: { slug: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    await fetch(`/api/products/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("متأكد إنك عايز تحذف المنتج ده؟")) return;
    setLoading(true);
    await fetch(`/api/products/${slug}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={loading} onClick={togglePublish} className="text-xs text-brand-600 hover:underline">
        {status === "PUBLISHED" ? "إلغاء النشر" : "نشر"}
      </button>
      <button disabled={loading} onClick={handleDelete} className="text-xs text-red-600 hover:underline">
        حذف
      </button>
    </div>
  );
}
