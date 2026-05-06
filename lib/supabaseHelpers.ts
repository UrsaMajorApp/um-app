import { supabase } from "./supabase";

type SupabaseRowsResponse<T> = {
  data: T[] | null;
  error: unknown;
};

export function rowsOrEmpty<T = unknown>(res: SupabaseRowsResponse<T>): T[] {
  if (res.error || !res.data) return [];
  return res.data;
}

export async function resolveOwnedOrgId(
  userId: string,
): Promise<string | null> {
  if (!supabase) return null;

  const res = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", userId)
    .limit(1)
    .maybeSingle();

  return res.data?.id ?? null;
}
