import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-white text-xl font-extrabold mb-3">دُكَّانَكْ</div>
          <p className="text-gray-400 leading-relaxed">
            متجرك المصري لتسوق منتجات متنوعة بأسعار مناسبة، مع الدفع عند الاستلام وشحن لكل المحافظات.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">تعرف علينا</div>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/about">من نحن</Link></li>
            <li><Link href="/contact">اتصل بنا</Link></li>
            <li><Link href="/faq">الأسئلة الشائعة</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">خدمة العملاء</div>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/shipping-policy">سياسة الشحن</Link></li>
            <li><Link href="/return-policy">الاسترجاع والاستبدال</Link></li>
            <li><Link href="/privacy">سياسة الخصوصية</Link></li>
            <li><Link href="/terms">الشروط والأحكام</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">تواصل واتساب</div>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a
                href="https://wa.me/201206306778"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                01206306778
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/201039265524"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                01039265524
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} دُكَّانَكْ. جميع الحقوق محفوظة.
      </div>

      <a
        href="https://wa.me/201206306778"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 z-50 bg-green-500 text-white rounded-full px-4 py-3 text-sm font-bold shadow-lg"
      >
        واتساب
      </a>
    </footer>
  );
}
