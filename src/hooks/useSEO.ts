import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

export const useSEO = ({ title, description, path, ogImage }: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to find or create meta tag
    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Update Standard Description
    updateOrCreateMeta("name", "description", description);

    const canonicalUrl = `https://travelverse.ai/${path.replace(/^\//, "")}`;

    // 3. Update Open Graph Tags
    updateOrCreateMeta("property", "og:title", title);
    updateOrCreateMeta("property", "og:description", description);
    updateOrCreateMeta("property", "og:url", canonicalUrl);
    updateOrCreateMeta("property", "og:type", "website");
    updateOrCreateMeta("property", "og:image", ogImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80");

    // 4. Update Twitter Card Tags
    updateOrCreateMeta("name", "twitter:card", "summary_large_image");
    updateOrCreateMeta("name", "twitter:title", title);
    updateOrCreateMeta("name", "twitter:description", description);
    updateOrCreateMeta("name", "twitter:image", ogImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80");

    // 5. Update Canonical Link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

  }, [title, description, path, ogImage]);
};
