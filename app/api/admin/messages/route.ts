import { isAdminRequest } from "../../../../lib/admin-auth";
import { getContactSubmissions, hasSupabaseConfig } from "../../../../lib/supabase-server";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: "Supabase is not configured." }, { status: 503 });

  try {
    return Response.json(await getContactSubmissions(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not load contact messages." }, { status: 502 });
  }
}