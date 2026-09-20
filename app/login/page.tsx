"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">تسجيل الدخول</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <Link href="/forgot-password" className="hover:text-brand-600">نسيت كلمة المرور؟</Link>
        <Link href="/register" className="hover:text-brand-600">إنشاء حساب جديد</Link>
      </div>
    </div>
  );
}
