import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Private app areas. Rules are prefix matches, so each is written as the exact
// path ("$") plus its sub-paths ("/") — a bare "/partner" would also block the
// public /partnerships page. Each is listed under /ru as well.
const PRIVATE = ["/admin", "/coordinator", "/participant", "/partner", "/dashboard", "/exam", "/staff", "/examPartner", "/qp", "/brochure"];

const disallow = [
  "/api/",
  ...PRIVATE.flatMap((p) => [`${p}$`, `${p}/`, `/ru${p}$`, `/ru${p}/`]),
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
