import { randomUUID } from "node:crypto";
import { isAdminRequest } from "../../../../lib/admin-auth";
import { hasSupabaseConfig, uploadPortfolioImage } from "../../../../lib/supabase-server";

const maxImageSize = 4 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: "Supabase is not configured." }, { status: 503 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const kind = form.get("kind");
  const projectId = form.get("projectId");
  if (!(file instanceof File) || !extensions[file.type] || file.size > maxImageSize) {
    return Response.json({ error: "Use a JPG, PNG, WebP, or AVIF image smaller than 4 MB." }, { status: 400 });
  }
  if (kind !== "profile" && kind !== "project") return Response.json({ error: "Choose a valid image type." }, { status: 400 });
  if (kind === "project" && (typeof projectId !== "string" || !/^[a-z0-9-]{1,80}$/.test(projectId))) {
    return Response.json({ error: "Invalid project." }, { status: 400 });
  }

  const folder = kind === "profile" ? "profile" : `projects/${projectId as string}`;
  const path = `${folder}/${randomUUID()}.${extensions[file.type]}`;
  try {
    const url = await uploadPortfolioImage(file, path);
    return Response.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not upload image." }, { status: 502 });
  }
}