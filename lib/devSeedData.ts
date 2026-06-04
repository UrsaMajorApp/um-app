// Dev seed data: наполняет demo-базу семьями, курсами, заявками и событиями для показа приложения.
import { isSupabaseConfigured, supabase } from '$lib/supabase';

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

function formatSupabaseError(error: { message?: string } | null) {
  return error?.message || 'Supabase request failed.';
}

async function runDevDataRpc(client: ReturnType<typeof requireSupabase>, name: string) {
  const { error } = await client.rpc(name);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function seedDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'seed_dev_data');
  await runDevDataRpc(client, 'seed_dev_extra_data');
  await runDevDataRpc(client, 'seed_parent_showcase_data');
  await runDevDataRpc(client, 'seed_parent_mentor_request_showcase_data');
  await runDevDataRpc(client, 'seed_mvp_organization_showcase_data');
}

export async function clearDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'clear_parent_mentor_request_showcase_data');
  await runDevDataRpc(client, 'clear_mvp_organization_showcase_data');
  await runDevDataRpc(client, 'clear_parent_showcase_data');
  await runDevDataRpc(client, 'clear_dev_extra_data');
  await runDevDataRpc(client, 'clear_dev_data');
}

export async function clearAllDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'clear_parent_mentor_request_showcase_data');
  await runDevDataRpc(client, 'clear_mvp_organization_showcase_data');
  await runDevDataRpc(client, 'clear_all_dev_data');
  await runDevDataRpc(client, 'clear_dev_extra_data');
  await runDevDataRpc(client, 'clear_parent_showcase_data');
}

export async function getDevDataSeeded() {
  const client = requireSupabase();
  const { data, error } = await client.rpc('is_dev_data_seeded');
  if (error) throw new Error(formatSupabaseError(error));
  return data === true;
}
