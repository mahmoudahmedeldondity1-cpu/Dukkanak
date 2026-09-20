// Rate Limiter بسيط في الذاكرة — يحمي endpoints الحساسة (تسجيل، تسجيل دخول)
// من محاولات متكررة سريعة (Brute force).
//
// ملاحظة مهمة: هذا الحل يعمل جيدًا على سيرفر واحد (مثل VPS تقليدي)، لكن في
// بيئة Serverless (مثل Vercel) كل Instance له ذاكرته الخاصة، فالحد قد لا
// يكون دقيقًا 100% عبر كل الطلبات. للإنتاج الفعلي بحجم كبير، يُفضّل استخدام
// حل موزّع مثل Upstash Redis (@upstash/ratelimit) بدلًا من هذا الحل المحلي.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
