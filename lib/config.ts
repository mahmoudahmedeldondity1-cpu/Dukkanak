/**
 * Site configuration helper
 * Centralizes the application URL and general configuration.
 * Avoids hardcoding any assumed domain.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export const SITE_NAME_AR = "دُكَّانَكْ";
export const SITE_NAME_EN = "Dukkanak";
export const CURRENCY = "EGP";
