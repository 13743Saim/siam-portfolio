import { isAdminConfigured } from "../../../../lib/admin-auth";
import { hasSupabaseConfig } from "../../../../lib/supabase-server";

export async function GET() {
  return Response.json(
    { adminConfigured: isAdminConfigured(), storageConfigured: hasSupabaseConfig() },
    { headers: { "Cache-Control": "no-store" } },
  );
}