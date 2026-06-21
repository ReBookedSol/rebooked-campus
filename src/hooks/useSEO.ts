import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_TITLE = "ReBooked Living";
const BASE_URL = "https://living.rebookedsolutions.co.za";
const DEFAULT_OG_IMAGE = `${BASE_URL}/favicon.png`;

const upsertMeta = (selector: string, attr: "name" | "property", key: string, value: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const composeTitle = (title: string) => {
  // Don't double-append the brand if the title already contains it.
  if (title.toLowerCase().includes(BASE_TITLE.toLowerCase())) return title;
  return `${title} | ${BASE_TITLE}`;
};

export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    const finalTitle = title ? composeTitle(title) : undefined;

    if (finalTitle) document.title = finalTitle;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
    }
    if (keywords) {
      upsertMeta('meta[name="keywords"]', "name", "keywords", keywords);
    }

    if (ogTitle || finalTitle) {
      upsertMeta('meta[property="og:title"]', "property", "og:title", ogTitle || finalTitle!);
    }
    if (ogDescription || description) {
      upsertMeta('meta[property="og:description"]', "property", "og:description", ogDescription || description!);
    }

    // Always have an absolute og:image so social platforms can render previews.
    const absoluteOgImage = ogImage
      ? (ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`)
      : DEFAULT_OG_IMAGE;
    upsertMeta('meta[property="og:image"]', "property", "og:image", absoluteOgImage);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absoluteOgImage);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      const absolute = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
      link.href = absolute;
      upsertMeta('meta[property="og:url"]', "property", "og:url", absolute);
    }

    // Per-page JSON-LD (rich results). We tag scripts with a data attribute so we can clean them up.
    let scriptEls: HTMLScriptElement[] = [];
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.routeJsonld = "true";
        s.text = JSON.stringify(block);
        document.head.appendChild(s);
        scriptEls.push(s);
      });
    }

    return () => {
      // Reset title to brand default when leaving the route.
      document.title = `${BASE_TITLE} — NSFAS Student Accommodation SA`;
      // Remove any per-route JSON-LD we added.
      scriptEls.forEach((s) => s.parentNode?.removeChild(s));
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, JSON.stringify(jsonLd)]);
};

export default useSEO;
