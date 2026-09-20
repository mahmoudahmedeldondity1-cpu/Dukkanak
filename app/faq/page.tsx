"use client";

import { useState } from "react";

const faqs = [
  { q: "إزاي أعرف حالة طلبي؟", a: "تقدر تتابع حالة طلبك من صفحة \"طلباتي\" في حسابك، أول ما تسجل دخولك." },
  { q: "هل الدفع عند الاستلام متاح؟", a: "أيوه، الدفع عند الاستلام متاح لكل الطلبات في كل محافظات مصر." },
  { q: "كام مدة التوصيل؟", a: "بتختلف حسب المحافظة، وهتلاقي تقدير للمدة وقت إتمام الطلب." },
  { q: "أقدر أرجع المنتج إزاي؟", a: "تقدر تطلب استرجاع أو استبدال حسب سياسة الاسترجاع الموضحة في صفحة سياسة الاسترجاع." },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h1>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="card">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-right p-4 font-medium flex justify-between items-center"
            >
              {f.q}
              <span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="px-4 pb-4 text-sm text-gray-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
