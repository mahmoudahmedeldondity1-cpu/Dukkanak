"use client";

import { useLocale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-semibold text-gray-700 shadow-sm">
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded-md px-2.5 py-1 transition-all ${
          locale === "ar"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-gray-600 hover:text-brand-600"
        }`}
        aria-label="تغيير اللغة إلى العربية"
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-md px-2.5 py-1 transition-all ${
          locale === "en"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-gray-600 hover:text-brand-600"
        }`}
        aria-label="Switch language to English"
      >
        English
      </button>
    </div>
  );
}
