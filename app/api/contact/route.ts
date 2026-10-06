import { saveContactSubmission } from "../../../lib/supabase-server";
const fallbackRecipient = "siam.appalux@gmail.com";
const maxBodyLength = 10_000;

function jsonResponse(body: { error?: string; ok?: boolean; emailSent?: boolean }, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Expected a JSON request." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBodyLength) {
    return jsonResponse({ error: "Message is too large." }, 413);
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxBodyLength) {
      return jsonResponse({ error: "Message is too large." }, 413);
    }
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const { name, email, message, website } = payload as Record<string, unknown>;
  if (typeof website === "string" && website.trim()) {
    return jsonResponse({ ok: true }, 200);
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return jsonResponse({ error: "Name, email, and message are required." }, 400);
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    cleanName.length < 1 || cleanName.length > 100 ||
    cleanEmail.length > 254 || !validEmail.test(cleanEmail) ||
    cleanMessage.length < 1 || cleanMessage.length > 5000
  ) {
    return jsonResponse({ error: "Please check the form fields and try again." }, 400);
  }

  try {
    await saveContactSubmission({ name: cleanName, email: cleanEmail, message: cleanMessage });
  } catch {
    return jsonResponse({ error: "Your message could not be saved. Please try again later." }, 503);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || fallbackRecipient;
  let emailSent = false;
  if (apiKey && from) {
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          reply_to: cleanEmail,
          subject: `Portfolio contact from ${cleanName}`,
          text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
        }),
      });
      emailSent = resendResponse.ok;
      if (!resendResponse.ok) {
        let providerError: { name?: unknown; message?: unknown } = {};
        try {
          providerError = await resendResponse.json() as typeof providerError;
        } catch {
          providerError = {};
        }
        console.error("Resend email request failed.", {
          status: resendResponse.status,
          name: typeof providerError.name === "string" ? providerError.name : undefined,
          message: typeof providerError.message === "string" ? providerError.message.slice(0, 300) : undefined,
        });
      }
    } catch {
      console.error("Resend email service is unavailable.");
    }
  }

  return jsonResponse({ ok: true, emailSent }, 200);
}
