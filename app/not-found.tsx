import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold text-brand-600 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-2">الصفحة اللي بتدور عليها مش موجودة</p>
      <p className="text-sm text-gray-400 mb-8">ممكن يكون الرابط غلط أو الصفحة اتشالت</p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-primary">الصفحة الرئيسية</Link>
        <Link href="/products" className="btn-secondary">تصفح المنتجات</Link>
      </div>
    </div>
  );
}
