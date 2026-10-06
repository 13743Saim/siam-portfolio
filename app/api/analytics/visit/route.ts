import { recordSiteView } from "../../../../lib/supabase-server";

export async function POST(request: Request) {
  const header = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "ZZ";
  const countryCode = /^[A-Z]{2}$/.test(header) ? header : "ZZ";

  try {
    await recordSiteView(countryCode);
  } catch {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}