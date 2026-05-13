// Dev seed data: наполняет demo-базу семьями, курсами, заявками и событиями для показа приложения.
import { isSupabaseConfigured, supabase } from '$lib/supabase';

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

type SupabaseRpcError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function formatSupabaseError(error: SupabaseRpcError | null) {
  return error?.message || 'Supabase request failed.';
}

function isMissingRpcError(error: SupabaseRpcError | null) {
  if (!error) return false;
  return (
    error.code === 'PGRST202' ||
    error.message?.includes('Could not find the function') ||
    error.message?.includes('function') && error.message.includes('schema cache')
  );
}

async function runDevDataRpc(
  client: ReturnType<typeof requireSupabase>,
  name: string,
  opts: { optional?: boolean } = {},
) {
  const { error } = await client.rpc(name);
  if (opts.optional && isMissingRpcError(error)) return;
  if (error) throw new Error(formatSupabaseError(error));
}

export async function seedDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'seed_dev_data');
  await runDevDataRpc(client, 'seed_dev_extra_data', { optional: true });
}

export async function clearDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'clear_dev_extra_data', { optional: true });
  await runDevDataRpc(client, 'clear_dev_data');
}

export async function clearAllDevData() {
  const client = requireSupabase();
  await runDevDataRpc(client, 'clear_dev_extra_data', { optional: true });
  await runDevDataRpc(client, 'clear_all_dev_data');
}

export async function getDevDataSeeded() {
  const client = requireSupabase();
  const { data, error } = await client.rpc('is_dev_data_seeded');
  if (error) throw new Error(formatSupabaseError(error));
  return data === true;
}
