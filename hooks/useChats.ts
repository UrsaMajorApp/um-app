import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '$contexts/AuthContext';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export interface Chat {
  id: string;
  name: string;
  icon_name: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  archived: boolean;
}

type ConversationParticipantRow = {
  conversation_id: string;
  unread_count: number | null;
};

type ConversationRow = Omit<Chat, 'unread_count'>;

export function useChats() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const partRes = await supabase
      .from('conversation_participants')
      .select('conversation_id, unread_count')
      .eq('user_id', user.id);
    const participantRows = rowsOrEmpty<ConversationParticipantRow>(partRes);
    const conversationIds = participantRows.map((row) => row.conversation_id).filter(Boolean);

    if (conversationIds.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    const unreadMap = new Map<string, number>();
    for (const row of participantRows) {
      unreadMap.set(row.conversation_id, row.unread_count ?? 0);
    }

    const convRes = await supabase
      .from('conversations')
      .select('id, name, icon_name, last_message, last_message_at, archived')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });
    const convRows = rowsOrEmpty<ConversationRow>(convRes);

    setChats(
      convRows.map((c) => ({
        id: c.id,
        name: c.name,
        icon_name: c.icon_name ?? 'message-circle',
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread_count: unreadMap.get(c.id) ?? 0,
        archived: c.archived ?? false,
      })),
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  const archiveChat = async (id: string) => {
    if (!supabase) return;
    await supabase.from('conversations').update({ archived: true }).eq('id', id);
    refresh();
  };

  const markRead = async (id: string) => {
    if (!supabase || !user?.id) return;
    await supabase
      .from('conversation_participants')
      .update({ unread_count: 0 })
      .eq('conversation_id', id)
      .eq('user_id', user.id);
    refresh();
  };

  return { chats, loading, refresh, archiveChat, markRead };
}

// ─── useChatMessages ──────────────────────────────────────────
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  is_mine: boolean;
}

type MessageRow = Omit<ChatMessage, 'is_mine'>;

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    const rows = rowsOrEmpty<MessageRow>(res);
    setMessages(
      rows.map((m) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        body: m.body,
        created_at: m.created_at,
        is_mine: m.sender_id === user?.id,
      })),
    );
    setLoading(false);
  }, [conversationId, user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  const sendMessage = async (text: string) => {
    if (!supabase || !conversationId || !text.trim()) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user?.id ?? null,
      body: text.trim(),
    });
    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: text.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
    refresh();
  };

  return { messages, loading, refresh, sendMessage };
}
