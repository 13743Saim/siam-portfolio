import { defaultPortfolioContent, type PortfolioContent, type PortfolioProject } from "./portfolio-data";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type SiteView = {
  country_code: string;
  created_at: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function apiHeaders(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    ...(key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` }),
    ...extra,
  };
}

function isProject(value: unknown): value is PortfolioProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Record<string, unknown>;
  return typeof project.id === "string" && typeof project.index === "string" &&
    typeof project.title === "string" && typeof project.summary === "string" &&
    Array.isArray(project.tags) && project.tags.every((tag) => typeof tag === "string") &&
    typeof project.visual === "string" && ["market", "analysis", "network", "football"].includes(String(project.kind)) &&
    typeof project.imageUrl === "string" && typeof project.published === "boolean";
}

export function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return typeof content.profileImageUrl === "string" && Array.isArray(content.projects) &&
    content.projects.length <= 30 && content.projects.every(isProject) &&
    content.projects.every((project) => project.title.length <= 100 && project.summary.length <= 2000 && project.tags.length <= 12);
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const config = getSupabaseConfig();
  if (!config) return defaultPortfolioContent;

  const response = await fetch(`${config.url}/rest/v1/portfolio_content?id=eq.main&select=content`, {
    headers: apiHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = "";
    try {
      const error = await response.json() as { message?: unknown };
      if (typeof error.message === "string") detail = `: ${error.message}`;
    } catch {
      detail = "";
    }
    throw new Error(`Portfolio database returned HTTP ${response.status}${detail}.`);
  }
  const rows = await response.json() as { content?: unknown }[];
  const content = rows[0]?.content;
  return isPortfolioContent(content) ? content : defaultPortfolioContent;
}

export async function savePortfolioContent(content: PortfolioContent) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(`${config.url}/rest/v1/portfolio_content?on_conflict=id`, {
    method: "POST",
    headers: apiHeaders(config.key, {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify({ id: "main", content, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Portfolio changes could not be saved.");
}

export async function saveContactSubmission(submission: Pick<ContactSubmission, "name" | "email" | "message">) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(`${config.url}/rest/v1/contact_submissions`, {
    method: "POST",
    headers: apiHeaders(config.key, {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify(submission),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Contact submission could not be saved.");
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(`${config.url}/rest/v1/contact_submissions?select=id,name,email,message,created_at&order=created_at.desc&limit=100`, {
    headers: apiHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Contact inbox is unavailable.");
  return await response.json() as ContactSubmission[];
}

export async function recordSiteView(countryCode: string) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(`${config.url}/rest/v1/portfolio_site_views`, {
    method: "POST",
    headers: apiHeaders(config.key, {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify({ country_code: countryCode }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Page view could not be recorded.");
}

export async function getSiteViews(): Promise<SiteView[]> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const params = new URLSearchParams({
    select: "country_code,created_at",
    created_at: `gte.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`,
    order: "created_at.desc",
    limit: "10000",
  });
  const response = await fetch(`${config.url}/rest/v1/portfolio_site_views?${params}`, {
    headers: apiHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Analytics are unavailable.");
  return await response.json() as SiteView[];
}

export async function uploadPortfolioImage(file: File, path: string) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${config.url}/storage/v1/object/portfolio-assets/${safePath}`, {
    method: "POST",
    headers: apiHeaders(config.key, {
      "Content-Type": file.type,
      "x-upsert": "true",
    }),
    body: new Uint8Array(await file.arrayBuffer()),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Image upload failed.");
  return `${config.url}/storage/v1/object/public/portfolio-assets/${safePath}`;
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseConfig());
}