import { isAdminRequest } from "../../../../lib/admin-auth";
import { getPortfolioContent, hasSupabaseConfig, isPortfolioContent, savePortfolioContent } from "../../../../lib/supabase-server";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  try {
    return Response.json(await getPortfolioContent(), { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    return Response.json(
      { error: cause instanceof Error ? cause.message : "Could not load portfolio content." },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: "Supabase is not configured." }, { status: 503 });

  let content: unknown;
  try {
    content = await request.json();
  } catch {
    return Response.json({ error: "Invalid content." }, { status: 400 });
  }
  if (!isPortfolioContent(content)) return Response.json({ error: "Please check project fields and try again." }, { status: 400 });

  try {
    await savePortfolioContent(content);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not save portfolio content." }, { status: 502 });
  }
}