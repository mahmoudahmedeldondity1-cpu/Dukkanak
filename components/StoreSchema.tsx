export default function StoreSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "دُكَّانَكْ",
    alternateName: "Dukkanak",

    url: "https://dukanak.vercel.app",

    logo: "https://dukanak.vercel.app/logo.png",

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
      availableLanguage: ["Arabic"],
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
