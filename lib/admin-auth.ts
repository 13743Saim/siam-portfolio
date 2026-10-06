import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "siam_admin";
const sessionDurationSeconds = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionSecret());
}

export function verifyAdminPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (typeof password !== "string" || !expected || password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function createAdminCookie() {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured.");
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + sessionDurationSeconds * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=${payload}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionDurationSeconds}${secure}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export function isAdminRequest(request: Request) {
  const secret = getSessionSecret();
  if (!secret) return false;
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  const token = cookie?.slice(cookieName.length + 1);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof session.exp === "number" && session.exp > Date.now();
  } catch {
    return false;
  }
}