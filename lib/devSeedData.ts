import { isSupabaseConfigured, supabase } from "$lib/supabase";

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function formatSupabaseError(error: { message?: string } | null) {
  return error?.message || "Supabase request failed.";
}

export async function seedDevData() {
  const client = requireSupabase();
  const { error } = await client.rpc("seed_dev_data");
  if (error) throw new Error(formatSupabaseError(error));
}

export async function clearDevData() {
  const client = requireSupabase();
  const { error } = await client.rpc("clear_dev_data");
  if (error) throw new Error(formatSupabaseError(error));
}

export async function clearAllDevData() {
  const client = requireSupabase();
  const { error } = await client.rpc("clear_all_dev_data");
  if (error) throw new Error(formatSupabaseError(error));
}

export async function getDevDataSeeded() {
  const client = requireSupabase();
  const { data, error } = await client.rpc("is_dev_data_seeded");
  if (error) throw new Error(formatSupabaseError(error));
  return data === true;
}
