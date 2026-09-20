"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!session) {
    return (
      <div className="card p-4 mb-4 text-sm text-gray-600">
        <Link href="/login" className="text-brand-600 font-medium">سجّل دخولك</Link> عشان تقدر تضيف تقييم
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, comment }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage(data.message);
      setTimeout(onDone, 2000);
    } else {
      setMessage(data.error || "حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4 space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">تقييمك</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "text-amber-400" : "text-gray-300"}>
              ★
            </button>
          ))}
        </div>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التقييم (اختياري)" className="input-field" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب رأيك في المنتج..." className="input-field" rows={3} />
      {message && <p className="text-sm text-brand-700">{message}</p>}
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </form>
  );
}
