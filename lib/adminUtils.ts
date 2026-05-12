// Admin utils: содержит helpers для отображения статусов и admin-данных.
import { type Href, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { ADMIN_ROUTES, type AdminRouteKey } from '$constants/admin';
import { LAYOUT, SPACING } from '$constants/theme';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';
import { useIsDesktop } from '$lib/useIsDesktop';
import type { AdminConversationParticipantRow } from '$types/admin';

export function useAdminLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  return {
    isTablet: width >= 768,
    isDesktop,
    paddingX: isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl,
  };
}

export function formatAdminDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function useAdminNavigation() {
  const router = useRouter();
  return (route: AdminRouteKey) => router.push(ADMIN_ROUTES[route] as Href);
}

export async function ensureConversation(
  currentUserId: string,
  otherUserId: string,
  name: string,
  iconName: string,
) {
  if (!supabase || !isSupabaseConfigured) return { id: null, error: 'Supabase is not configured' };
  const [currentParts, otherParts] = await Promise.all([
    supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId),
    supabase.from('conversation_participants').select('conversation_id').eq('user_id', otherUserId),
  ]);
  const currentIds = new Set(
    rowsOrEmpty<AdminConversationParticipantRow>(currentParts).map((p) => p.conversation_id),
  );
  const shared = rowsOrEmpty<AdminConversationParticipantRow>(otherParts).find((p) =>
    currentIds.has(p.conversation_id),
  );
  if (shared?.conversation_id) return { id: shared.conversation_id as string, error: null };

  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({
      name,
      icon_name: iconName,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error || !conv) return { id: null, error: error?.message ?? 'Не удалось создать чат' };
  await supabase.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: currentUserId, unread_count: 0 },
    { conversation_id: conv.id, user_id: otherUserId, unread_count: 0 },
  ]);
  return { id: conv.id as string, error: null };
}
