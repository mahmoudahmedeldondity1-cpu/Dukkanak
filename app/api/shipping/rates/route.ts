import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EGYPT_GOVERNORATES, DEFAULT_BASE_SHIPPING_FEE, DEFAULT_FREE_SHIPPING_THRESHOLD } from "@/lib/governorates";

// Public safe endpoint exposing configured shipping rates and free shipping threshold
export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["free_shipping_threshold", "default_shipping_fee", "shipping_rates_json"],
        },
      },
    });

    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    const freeShippingThreshold = Number(map.free_shipping_threshold) || DEFAULT_FREE_SHIPPING_THRESHOLD;
    const defaultShippingFee = Number(map.default_shipping_fee) || DEFAULT_BASE_SHIPPING_FEE;

    let customRates: Record<string, number> = {};
    if (map.shipping_rates_json) {
      try {
        customRates = JSON.parse(map.shipping_rates_json);
      } catch {}
    }

    // Build governorates map with status
    const governorates = EGYPT_GOVERNORATES.map((gov) => {
      const rate = customRates[gov] ?? defaultShippingFee;
      return {
        name: gov,
        shippingFee: rate,
        isConfigured: true,
      };
    });

    return NextResponse.json({
      governorates,
      defaultShippingFee,
      freeShippingThreshold,
    });
  } catch (err: any) {
    return NextResponse.json({
      governorates: EGYPT_GOVERNORATES.map((g) => ({ name: g, shippingFee: DEFAULT_BASE_SHIPPING_FEE, isConfigured: true })),
      defaultShippingFee: DEFAULT_BASE_SHIPPING_FEE,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
    });
  }
}
