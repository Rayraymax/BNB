import { SITE_BASE_URL } from "../config.js";

const defaultImage = "/assets/uploads/alkey-building-background.jpeg";

function absoluteUrl(path) {
  if (!path) return SITE_BASE_URL || location.origin;
  if (/^https?:\/\//.test(path)) return path;
  const base = SITE_BASE_URL || location.origin;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function upsertMeta(selector, attr, value, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [name, key] = attr;
    tag.setAttribute(name, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function setSeo({ title, description, image = defaultImage, canonical = location.pathname, jsonLd }) {
  document.title = title;
  upsertMeta('meta[name="description"]', ["name", "description"], null, description);
  upsertMeta('meta[property="og:title"]', ["property", "og:title"], null, title);
  upsertMeta('meta[property="og:description"]', ["property", "og:description"], null, description);
  upsertMeta('meta[property="og:image"]', ["property", "og:image"], null, absoluteUrl(image));
  upsertMeta('meta[property="og:type"]', ["property", "og:type"], null, "website");
  upsertMeta('meta[property="og:url"]', ["property", "og:url"], null, absoluteUrl(canonical));
  upsertMeta('meta[property="og:site_name"]', ["property", "og:site_name"], null, title.split("|")[0].trim());
  upsertMeta('meta[name="twitter:card"]', ["name", "twitter:card"], null, "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', ["name", "twitter:title"], null, title);
  upsertMeta('meta[name="twitter:description"]', ["name", "twitter:description"], null, description);
  upsertMeta('meta[name="twitter:image"]', ["name", "twitter:image"], null, absoluteUrl(image));

  let canonicalTag = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement("link");
    canonicalTag.rel = "canonical";
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.href = absoluteUrl(canonical);

  document.head.querySelectorAll("script[data-jsonld]").forEach((script) => script.remove());
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.jsonld = "true";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

export function lodgingJsonLd(settings) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: settings.name,
    description: settings.metaDescription,
    image: absoluteUrl(settings.coverImage),
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Nairobi",
      addressCountry: "KE"
    },
    url: absoluteUrl("/"),
    priceRange: "KES",
    checkinTime: settings.checkIn,
    checkoutTime: settings.checkOut,
    amenityFeature: settings.whyChoose.map((item) => ({
      "@type": "LocationFeatureSpecification",
      name: item.title,
      value: true
    }))
  };
}

export function roomJsonLd(room, settings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      lodgingJsonLd(settings),
      {
        "@type": "Product",
        name: room.name,
        description: room.description,
        image: absoluteUrl(room.coverImage),
        brand: { "@type": "Brand", name: settings.name },
        offers: {
          "@type": "Offer",
          priceCurrency: "KES",
          price: room.price,
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/rooms/${room.slug}`)
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Maximum occupancy", value: room.capacity },
          { "@type": "PropertyValue", name: "Room type", value: room.size }
        ]
      }
    ]
  };
}

export function serviceJsonLd(service, settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "LodgingBusiness",
      name: settings.name,
      telephone: settings.phone
    },
    areaServed: settings.address
  };
}
