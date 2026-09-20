"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("حصل خطأ. جرّب تاني بعد شوية.");
        return;
      }

      setDone(true);
    } catch {
      setError("حصل خطأ. جرّب تاني بعد شوية.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">نسيت كلمة المرور؟</h1>

      {done ? (
        <p className="text-neutral-600 leading-7">
          لو الإيميل مسجّل عندنا، هتوصّلك رسالة فيها رابط إعادة تعيين كلمة السر.
          لو الرسالة مجتش، بص في السبام.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
