import { clearAdminCookie } from "../../../../lib/admin-auth";

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": clearAdminCookie(),
    },
  });
}