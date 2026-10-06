import { createAdminCookie, isAdminConfigured, verifyAdminPassword } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: "Admin login is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const password = body && typeof body === "object" ? (body as Record<string, unknown>).password : undefined;
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": createAdminCookie(),
    },
  });
}