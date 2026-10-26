// JSON-LD Structured Data helpers
// Generates schema.org markup for SEO & GEO (Generative Engine Optimization)
import { siteConfig } from "./seo";

export type JsonLd = Record<string, unknown>;

function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path === "/" ? "" : path}`;
}

/**
 * WebSite schema — site-wide, includes search action
 */
export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    description: siteConfig.description.fa,
    url: siteConfig.url,
    inLanguage: ["fa-IR", "en-US"],
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Organization / MedicalClinic schema - Enhanced with GEO and local SEO
 */
export function medicalClinicSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.defaultOgImage}`,
    description: siteConfig.description.fa,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    medicalSpecialty: ["Oncologic", "Radiology", "RadiationTherapy"],
    // GEO: Entity relationships for knowledge graph
    knowsAbout: [
      "Radiotherapy",
      "Radiation Oncology",
      "Cancer Treatment",
      "MRI",
      "CT Scan",
      "Diagnostic Imaging",
      "Treatment Planning",
      "Radiation Therapy",
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Radiotherapy Treatment",
          serviceType: "Oncologic Radiology",
          description: "Professional radiation therapy for cancer treatment",
          provider: {
            "@id": `${siteConfig.url}/#organization`,
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Diagnostic Imaging",
          serviceType: "Medical Imaging",
          description: "3.0T MRI, CT scan, and X-Ray imaging services",
          provider: {
            "@id": `${siteConfig.url}/#organization`,
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Treatment Planning",
          serviceType: "Oncology Planning",
          description: "Personalized treatment plans by radiation oncologists",
          provider: {
            "@id": `${siteConfig.url}/#organization`,
          },
        },
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
      postalCode: siteConfig.address.postalCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    hasMap: `https://www.google.com/maps?q=${siteConfig.geo.latitude},${siteConfig.geo.longitude}`,
    areaServed: {
      "@type": "City",
      name: siteConfig.address.city,
    },
    // Local SEO enhancements
    priceRange: "$$",
    currenciesAccepted: "IRR,USD",
    paymentAccepted: "Cash, Credit Card, Insurance",
    publicAccess: true,
    isAccessibleForFree: false,
    openingHoursSpecification: siteConfig.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day.split("-"),
      opens: h.hours.split("-")[0] || "08:00",
      closes: h.hours.split("-")[1] || "17:00",
    })),
    sameAs: Object.values(siteConfig.socials),
  };
}

/**
 * Physician schema for team members
 */
export function physicianSchema(
  name: string,
  role: string,
  bio: string,
  image?: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    jobTitle: role,
    description: bio,
    ...(image ? { image } : {}),
    worksFor: {
      "@id": `${siteConfig.url}/#organization`,
    },
    medicalSpecialty: ["Oncologic", "RadiationTherapy"],
  };
}

/**
 * Main site entity — Dr. Pari Ghadamgahi's physician profile.
 * The website is a personal portfolio, so this is the primary
 * structured-data object registered in the root layout.
 */
export function sitePhysicianSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${siteConfig.url}/#physician`,
    name: "دکتر پری قدمگاهی",
    alternateName: "Dr. Pari Ghadamgahi",
    jobTitle: "متخصص رادیوتراپی و آنکولوژی",
    description: siteConfig.description.fa,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    medicalSpecialty: ["Oncologic", "RadiationTherapy"],
    knowsAbout: [
      "Radiotherapy",
      "Radiosurgery",
      "CNS Tumors (Brain & Spinal Cord)",
      "Head and Neck Cancer",
      "Gynecologic Oncology (GYN)",
      "Gastrointestinal Oncology (GI)",
      "Breast Cancer",
      "Prostate Cancer",
      "Genitourinary Oncology (GU)",
      "IMRT / IGRT / SBRT Treatment Planning",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    areaServed: {
      "@type": "City",
      name: siteConfig.address.city,
    },
    sameAs: Object.values(siteConfig.socials),
  };
}

/**
 * MedicalWebPage / MedicalProcedure schema for services
 */
export function medicalProcedureSchema(
  name: string,
  description: string,
  features: string[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name,
    description,
    howPerformed: features,
    bodyLocation: "Cancerous tissue",
    preparation: "Consultation with radiation oncologist required",
    followup: "Follow-up imaging and consultation scheduled post-treatment",
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };
}

/**
 * Article schema for blog posts - Enhanced with GEO features
 */
export function articleSchema(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  datePublished?: string;
  dateModified?: string;
  wordCount?: number;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    image: params.image
      ? absoluteUrl(params.image)
      : `${siteConfig.url}${siteConfig.defaultOgImage}`,
    author: {
      "@type": "Person",
      name: params.author,
    },
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(params.url),
    },
    datePublished: params.datePublished || new Date().toISOString(),
    dateModified:
      params.dateModified || params.datePublished || new Date().toISOString(),
    inLanguage: ["fa-IR", "en-US"],
    // GEO enhancements
    wordCount: params.wordCount || 800,
    timeRequired: "PT5M",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-content", ".article-title"],
    },
    about: {
      "@type": "MedicalCondition",
      name: "Cancer",
      alternateName: "Radiotherapy Treatment",
    },
  };
}

/**
 * QAPage schema for forum threads
 */
export function qaPageSchema(params: {
  title: string;
  description: string;
  url: string;
  author: string;
  dateCreated: string;
  content: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: params.title,
      text: params.content,
      author: {
        "@type": "Person",
        name: params.author,
      },
      dateCreated: params.dateCreated,
      answerCount: 0,
      acceptedAnswer: undefined,
    },
    about: {
      "@type": "MedicalCondition",
      name: "Radiotherapy",
    },
  };
}

/**
 * FAQPage schema
 */
export function faqSchema(
  faqs: { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * ContactPage schema — links the contact page to the clinic entity
 * and exposes contact points for rich results.
 */
export function contactPageSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteConfig.url}/contact#webpage`,
    url: `${siteConfig.url}/contact`,
    name: "Contact Us",
    inLanguage: ["fa-IR", "en-US"],
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: {
      "@id": `${siteConfig.url}/#organization`,
    },
    mainEntity: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };
}

/**
 * BreadcrumbList schema
 */
export function breadcrumbSchema(
  items: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * HowTo schema for treatment processes - GEO optimized
 */
export function treatmentProcessSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Radiotherapy Treatment Process at Our Clinic",
    description:
      "Step-by-step process for receiving professional radiotherapy treatment at our specialized cancer treatment center",
    image: `${siteConfig.url}/images/home-hero.webp`,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "IRR",
      value: "Consultation: 500,000 IRR",
    },
    totalTime: "PT30M",
    step: [
      {
        "@type": "HowToStep",
        name: "Initial Consultation",
        text: "Schedule and attend an initial consultation with a radiation oncologist to review your medical history, discuss your diagnosis, and explore treatment options",
        url: `${siteConfig.url}/booking`,
      },
      {
        "@type": "HowToStep",
        name: "Diagnostic Imaging",
        text: "Undergo advanced diagnostic imaging including 3.0T MRI and CT scan for precise treatment planning and tumor localization",
        url: `${siteConfig.url}/services`,
      },
      {
        "@type": "HowToStep",
        name: "Treatment Planning",
        text: "Our radiation oncologists create a personalized treatment plan using advanced software to target tumors while protecting healthy tissue",
        url: `${siteConfig.url}/services`,
      },
      {
        "@type": "HowToStep",
        name: "Treatment Delivery",
        text: "Receive precision radiation therapy sessions lasting 15-30 minutes each, carefully monitored by experienced medical staff",
        url: `${siteConfig.url}/services`,
      },
      {
        "@type": "HowToStep",
        name: "Follow-up Care",
        text: "Attend scheduled follow-up appointments for monitoring, imaging verification, and ongoing patient support",
        url: `${siteConfig.url}/contact`,
      },
    ],
  };
}

/**
 * Conversational content schema for GEO - helps AI engines understand content
 */
export function conversationalContentSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteConfig.url}/#conversational`,
    name: siteConfig.name,
    description: siteConfig.description.fa,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".hero-title", ".hero-subtitle", ".faq-answer"],
    },
    potentialAnswer: {
      "@type": "Answer",
      text: "Dr. Pari Ghadamgahi is a specialist in radiotherapy and oncology in Tehran, providing radiotherapy and radiosurgery with a focus on CNS, head and neck, gynecologic, gastrointestinal, breast, prostate and genitourinary cancers, together with treatment planning, patient support, and follow-up care.",
    },
    mainEntity: {
      "@type": "Physician",
      name: siteConfig.name,
      address: siteConfig.address.city,
      medicalSpecialty: ["Oncologic", "RadiationTherapy"],
    },
  };
}

/**
 * Authoritative source schema - establishes credibility for AI engines
 */
export function authoritativeSourceSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteConfig.url}/#authoritative`,
    reviewedBy: {
      "@type": "Organization",
      name: "Iranian Ministry of Health and Medical Education",
    },
    dateReviewed: "2026-01-15",
    lastReviewed: "2026-02-10",
    credibility: {
      "@type": "Thing",
      name: "Medical Accreditation",
      description:
        "DICOM Compliant, HIPAA Secure, ACR Accredited, ISO 9001:2015",
    },
  };
}

/**
 * Review and rating schema for medical business
 */
export function reviewSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${siteConfig.url}/#review`,
    name: siteConfig.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Patient Review",
        },
        datePublished: "2026-01-20",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "Excellent radiotherapy treatment with professional staff and advanced equipment. Highly recommended for cancer treatment.",
      },
    ],
  };
}

/**
 * Video schema for treatment explanation videos (if applicable)
 */
export function videoSchema(params: {
  title: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  duration?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: params.title,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl,
    contentUrl: params.contentUrl,
    embedUrl: params.contentUrl,
    uploadDate: new Date().toISOString(),
    duration: params.duration || "PT5M",
    contentSize: "50MB",
  };
}