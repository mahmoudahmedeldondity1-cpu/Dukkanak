"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsCsvTools() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult("");

    const text = await file.text();
    const res = await fetch("/api/admin/import/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    const data = await res.json();
    setImporting(false);

    if (res.ok) {
      setResult(`تم إضافة ${data.created} منتج وتحديث ${data.updated} منتج${data.errors.length ? ` (${data.errors.length} خطأ)` : ""}`);
      router.refresh();
    } else {
      setResult(data.error || "حدث خطأ أثناء الاستيراد");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-3">
      <a href="/api/admin/export/products" className="btn-secondary text-sm">تصدير CSV</a>
      <label className="btn-secondary text-sm cursor-pointer">
        {importing ? "جاري الاستيراد..." : "استيراد CSV"}
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={importing} />
      </label>
      {result && <span className="text-xs text-gray-500">{result}</span>}
    </div>
  );
}
