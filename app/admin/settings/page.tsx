"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="skeleton h-64" />;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">إعدادات المتجر</h1>
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">اسم المتجر</label>
          <input
            value={settings.store_name || ""}
            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رقم هاتف المتجر</label>
          <input
            value={settings.store_phone || ""}
            onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">بريد المتجر الإلكتروني</label>
          <input
            value={settings.store_email || ""}
            onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">حد الشحن المجاني (جنيه)</label>
            <input
              type="number"
              value={settings.free_shipping_threshold || ""}
              onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رسوم الشحن الافتراضية</label>
            <input
              type="number"
              value={settings.default_shipping_fee || ""}
              onChange={(e) => setSettings({ ...settings, default_shipping_fee: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.maintenance_mode === "true"}
            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked ? "true" : "false" })}
          />
          تفعيل وضع الصيانة (يُخفي المتجر عن الزوار مؤقتًا)
        </label>

        {saved && <p className="text-sm text-green-700">تم حفظ الإعدادات بنجاح</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
