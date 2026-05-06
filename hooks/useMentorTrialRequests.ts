import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { isSupabaseConfigured, supabase } from "$lib/supabase";
import { rowsOrEmpty } from "$lib/supabaseHelpers";

export type MentorTrialRequestTab = "requests" | "archive";

export interface MentorTrialRequest {
  id: string;
  child_name: string;
  child_age?: number;
  parent_name?: string;
  course_title: string;
  requested_slots: Array<{ day: string; time: string }>;
  confirmed_slot?: { day: string; time: string };
  status: string;
  outcome?: string;
  created_at: string;
}

export function useMentorTrialRequests(mentorId: string | undefined) {
  const [activeTab, setActiveTab] =
    useState<MentorTrialRequestTab>("requests");
  const [requests, setRequests] = useState<MentorTrialRequest[]>([]);
  const [archivedRequests, setArchivedRequests] = useState<
    MentorTrialRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>(
    {},
  );

  const refreshRequests = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !mentorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const pendingRes = await supabase
        .from("trial_lesson_requests")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setRequests(rowsOrEmpty<MentorTrialRequest>(pendingRes));

      const archivedRes = await supabase
        .from("trial_lesson_requests")
        .select("*")
        .eq("mentor_id", mentorId)
        .in("status", ["confirmed", "completed", "declined"])
        .order("created_at", { ascending: false })
        .limit(20);

      setArchivedRequests(rowsOrEmpty<MentorTrialRequest>(archivedRes));
    } catch (error) {
      console.error("Error fetching trial requests:", error);
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const selectSlot = (requestId: string, slotKey: string) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [requestId]: prev[requestId] === slotKey ? "" : slotKey,
    }));
  };

  const confirmRequest = async (requestId: string) => {
    const slot = selectedSlots[requestId];
    if (!slot) {
      Alert.alert(
        "Выберите время",
        "Пожалуйста, выберите удобное время для пробного урока",
      );
      return;
    }

    const [day, time] = slot.split("-");

    Alert.alert("Подтвердить пробный урок?", `Время: ${day} в ${time}`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Подтвердить",
        onPress: async () => {
          if (!supabase || !isSupabaseConfigured) return;

          const { error } = await supabase
            .from("trial_lesson_requests")
            .update({
              status: "confirmed",
              confirmed_slot: { day, time },
              confirmed_at: new Date().toISOString(),
            })
            .eq("id", requestId);

          if (error) {
            Alert.alert("Ошибка", error.message);
            return;
          }

          // TODO: Send push notification to parent
          setRequests((prev) =>
            prev.filter((request) => request.id !== requestId),
          );
          Alert.alert(
            "Успешно!",
            "Пробный урок подтверждён. Родитель получит уведомление.",
          );
          refreshRequests();
        },
      },
    ]);
  };

  const declineRequest = async (requestId: string) => {
    Alert.alert("Отклонить заявку?", "Родитель получит уведомление об отказе", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Отклонить",
        style: "destructive",
        onPress: async () => {
          if (!supabase || !isSupabaseConfigured) return;

          const { error } = await supabase
            .from("trial_lesson_requests")
            .update({
              status: "declined",
            })
            .eq("id", requestId);

          if (error) {
            Alert.alert("Ошибка", error.message);
            return;
          }

          // TODO: Send push notification to parent
          setRequests((prev) =>
            prev.filter((request) => request.id !== requestId),
          );
          refreshRequests();
        },
      },
    ]);
  };

  return {
    activeTab,
    setActiveTab,
    requests,
    archivedRequests,
    loading,
    selectedSlots,
    selectSlot,
    confirmRequest,
    declineRequest,
  };
}
