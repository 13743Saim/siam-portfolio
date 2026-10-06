import { getPortfolioContent } from "../../../lib/supabase-server";

export async function GET() {
  try {
    const content = await getPortfolioContent();
    return Response.json(
      { profileImageUrl: content.profileImageUrl, projects: content.projects.filter((project) => project.published) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Portfolio content is temporarily unavailable." }, { status: 502 });
  }
}