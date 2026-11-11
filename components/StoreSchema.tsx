import { getSiteUrl, SITE_NAME_AR, SITE_NAME_EN } from "@/lib/config";

export default function StoreSchema() {
  const siteUrl = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,

    url: siteUrl,

    logo: `${siteUrl}/logo.png`,

    description:
      "دُكَّانَكْ متجر إلكتروني مصري للتسوق أونلاين مع شحن لجميع محافظات مصر.",

    areaServed: {
      "@type": "Country",
      name: "Egypt",
    },

    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "EG",
      availableLanguage: ["Arabic", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
