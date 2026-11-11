export const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "المنوفية",
  "القليوبية", "البحيرة", "الغربية", "بورسعيد", "دمياط", "الإسماعيلية",
  "السويس", "كفر الشيخ", "الفيوم", "بني سويف", "المنيا", "أسيوط",
  "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد",
  "مطروح", "شمال سيناء", "جنوب سيناء",
];

export const DEFAULT_BASE_SHIPPING_FEE = 60;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000;

export interface ShippingCalculationOptions {
  governorate?: string | null;
  subtotalAfterDiscount: number;
  customRates?: Record<string, number>;
  freeShippingThreshold?: number;
  defaultBaseFee?: number;
}

/**
 * Calculates shipping fee dynamically based on persisted configuration,
 * discount totals, and destination governorate.
 */
export function getShippingFee(options: ShippingCalculationOptions): number {
  const {
    governorate,
    subtotalAfterDiscount,
    customRates = {},
    freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
    defaultBaseFee = DEFAULT_BASE_SHIPPING_FEE,
  } = options;

  if (freeShippingThreshold > 0 && subtotalAfterDiscount >= freeShippingThreshold) {
    return 0;
  }

  if (!governorate) {
    return defaultBaseFee;
  }

  return customRates[governorate] ?? defaultBaseFee;
}
