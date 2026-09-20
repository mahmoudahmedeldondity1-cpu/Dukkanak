export default function ShippingPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">سياسة الشحن</h1>
      <div className="prose prose-sm text-gray-600 space-y-4 leading-relaxed">
        <p>نوفر الشحن لكل محافظات مصر. تختلف مدة التوصيل ورسوم الشحن حسب المحافظة والمنطقة.</p>
        <ul className="list-disc pr-5 space-y-1">
          <li>الشحن المجاني للطلبات التي تتجاوز 1000 جنيه</li>
          <li>رسوم شحن ثابتة 60 جنيه لما دون ذلك (قابلة للتعديل من لوحة التحكم)</li>
          <li>مدة التوصيل التقديرية تظهر عند إتمام الطلب</li>
        </ul>
        <p>[نص Placeholder — يمكن تخصيصه ليعكس اتفاقيات الشحن الفعلية لمتجرك]</p>
      </div>
    </div>
  );
}
