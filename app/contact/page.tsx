"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ملاحظة: هذا النموذج جاهز للربط لاحقًا بخدمة بريد إلكتروني حقيقية (مثل Resend أو SendGrid)
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg font-medium mb-2">تم إرسال رسالتك بنجاح</p>
        <p className="text-gray-500 text-sm">هنرد عليك في أقرب وقت</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">اتصل بنا</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رسالتك</label>
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" rows={5} />
        </div>
        <button type="submit" className="btn-primary w-full">إرسال</button>
      </form>
    </div>
  );
}
