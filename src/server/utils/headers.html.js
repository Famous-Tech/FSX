export function getMetaData(pageMeta) {
  const safeMeta = pageMeta || { title: "", description: "", url: "" };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: safeMeta.title,
    description: safeMeta.description,
    url: safeMeta.url,
    publisher: {
      "@type": "Organization",
      name: "FAMOUS-TECH",
      logo: {
        "@type": "ImageObject",
        url: "https://www.famoustech.xyz/logo.png"
      }
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FAMOUS-TECH",
    url: "https://www.famoustech.xyz",
    logo: "https://www.famoustech.xyz/logo.png",
    description: "Famous-Tech est une entreprise de développement web et mobile en Haïti, spécialisée dans la création de solutions digitales innovantes.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Port-au-Prince",
      addressLocality: "Port-au-Prince",
      addressRegion: "Ouest",
      postalCode: "HT6113",
      addressCountry: "HT"
    },
    sameAs: [
      "https://github.com/Famous-Tech",
      "https://www.tiktok.com/@techfamous"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+509 44156629",
      email: "famoustechgroup@proton.me",
      contactType: "customer service",
      availableLanguage: ["fr"]    },
    areaServed: {
      "@type": "Country",
      name: "Haiti"
    },
    foundingDate: "2023",
    founder: {
      "@type": "Person",
      name: "Famous-Tech"
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FAMOUS-TECH - Solutions de développement web et mobile",
    description: "Transformez vos idées en solutions digitales innovantes avec Famous-Tech. Développement web, applications mobiles et stratégies digitales sur mesure en Haïti.",
    url: "https://www.famoustech.xyz",
    publisher: {
      "@type": "Organization",
      name: "FAMOUS-TECH",
      logo: {
        "@type": "ImageObject",
        url: "https://www.famoustech.xyz/logo.png"
      }
    }
  };

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicons/icon.png" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="description" content="${safeMeta.description}" />
    <meta name="keywords" content="Famous-Tech, développement web Haïti, applications mobiles, solutions digitales" />
    <meta name="author" content="Famous-Tech" />
    <meta property="og:title" content="${safeMeta.title}" />
    <meta property="og:description" content="${safeMeta.description}" />
    <meta property="og:image" content="https://www.famoustech.xyz/logo.png" />
    <meta property="og:url" content="${safeMeta.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Famous-Tech" />
    <meta property="og:locale" content="fr_HT" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeMeta.title}" />
    <meta name="twitter:description" content="${safeMeta.description}" />
    <meta name="twitter:image" content="https://www.famoustech.xyz/logo.png" />
    <meta name="twitter:creator" content="@famoustech_ht" />
    <title>${safeMeta.title}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
    <link rel="manifest" href="/favicons/site.webmanifest" />
    <link rel="canonical" href="${safeMeta.url}" />
    <!-- Styles have to be added dynamically-->
    <!-- Structured Data JSON-LD -->
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationData)}</script>
    <script type="application/ld+json">${JSON.stringify(websiteData)}</script>
  `;
};