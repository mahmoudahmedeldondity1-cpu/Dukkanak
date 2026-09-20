// واجهة بوابة الدفع (Payment Gateway Abstraction)
//
// الهدف: فصل منطق الطلب عن تفاصيل أي بوابة دفع معينة، بحيث يسهل إضافة
// بوابة حقيقية (Paymob, Fawry, ...) لاحقًا من غير ما تغيّر كود الطلبات.
//
// لا يوجد هنا أي مفاتيح API وهمية. أي بوابة حقيقية لازم تُضاف بمفاتيحها
// الفعلية في متغيرات البيئة (.env) ولا تُكتب مباشرة في الكود أبدًا.

export type PaymentIntent = {
  orderId: string;
  amount: number; // بالجنيه المصري
  currency: "EGP";
  customerEmail?: string;
  customerPhone?: string;
};

export type PaymentResult = {
  success: boolean;
  redirectUrl?: string; // رابط صفحة الدفع لو البوابة تطلب ذلك
  transactionId?: string;
  error?: string;
};

export interface PaymentGateway {
  /** اسم البوابة، يظهر في واجهة الأدمن */
  name: string;
  /** إنشاء عملية دفع جديدة، وإرجاع رابط تحويل العميل له إذا لزم */
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;
  /** التحقق من صحة إشعار الدفع القادم من البوابة (Webhook) */
  verifyWebhook(payload: unknown, signature?: string): Promise<boolean>;
}

/**
 * بوابة الدفع عند الاستلام — الافتراضية والوحيدة المفعّلة حاليًا.
 * لا تحتاج أي اتصال خارجي؛ الطلب يُؤكَّد فورًا بحالة دفع "COD".
 */
export class CashOnDeliveryGateway implements PaymentGateway {
  name = "الدفع عند الاستلام";

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    return { success: true, transactionId: `cod_${intent.orderId}` };
  }

  async verifyWebhook(): Promise<boolean> {
    return true; // لا يوجد Webhook فعلي لهذه الطريقة
  }
}

/**
 * هيكل جاهز لربط Paymob لاحقًا (بوابة دفع مصرية شائعة).
 * لتفعيلها فعليًا تحتاج:
 *   1. حساب تاجر على https://paymob.com
 *   2. المفاتيح: PAYMOB_API_KEY و PAYMOB_INTEGRATION_ID في .env (وليس هنا)
 *   3. تنفيذ استدعاءات API الحقيقية الخاصة بـ Paymob داخل الدوال أدناه
 *      (Authentication → Order Registration → Payment Key → iframe/redirect)
 *   4. تنفيذ verifyWebhook للتحقق من HMAC الخاص بـ Paymob على كل إشعار
 *
 * هذا الكلاس متروك غير مكتمل عن قصد — لا تُخترع بيانات دفع وهمية.
 */
export class PaymobGateway implements PaymentGateway {
  name = "الدفع بالبطاقة (Paymob)";

  async createPayment(_intent: PaymentIntent): Promise<PaymentResult> {
    return {
      success: false,
      error: "بوابة الدفع بالبطاقة غير مفعّلة بعد. يلزم ربط حساب Paymob الحقيقي أولًا.",
    };
  }

  async verifyWebhook(): Promise<boolean> {
    throw new Error("لم يتم تنفيذ التحقق من Webhook الخاص بـ Paymob بعد.");
  }
}

// نقطة الوصول الموحدة: أضف بوابات جديدة هنا مستقبلًا
export function getPaymentGateway(method: "COD" | "CARD" | "WALLET"): PaymentGateway {
  switch (method) {
    case "COD":
      return new CashOnDeliveryGateway();
    case "CARD":
    case "WALLET":
      return new PaymobGateway();
    default:
      throw new Error("طريقة دفع غير مدعومة");
  }
}
