import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import type { AuthUser } from "$contexts/AuthContext";
import type { GroupMember } from "$hooks/useMentorData";
import { isSupabaseConfigured, supabase } from "$lib/supabase";

export type MentorStudentReportSkill = {
  label: string;
  value: number;
};

type UseMentorStudentProfileParams = {
  user: AuthUser | null;
  student: GroupMember | undefined;
  reportSkills: MentorStudentReportSkill[];
};

export function useMentorStudentProfile({
  user,
  student,
  reportSkills,
}: UseMentorStudentProfileParams) {
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth] = useState(() =>
    new Date().toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    }),
  );

  const loadNotes = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("mentor_student_notes")
        .select("notes")
        .eq("mentor_id", user.id)
        .eq("student_id", student.id)
        .maybeSingle();

      if (!error && data) {
        setNotes(data.notes || "");
        setTempNotes(data.notes || "");
      } else if (!data) {
        setNotes("");
        setTempNotes("");
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [student?.id, user?.id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const startEditingNotes = () => {
    setTempNotes(notes);
    setIsEditingNotes(true);
  };

  const cancelEditingNotes = () => {
    setIsEditingNotes(false);
  };

  const saveNotes = async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      Alert.alert("Ошибка", "Не удалось сохранить заметки");
      return;
    }

    try {
      const { error } = await supabase.from("mentor_student_notes").upsert(
        {
          mentor_id: user.id,
          student_id: student.id,
          notes: tempNotes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "mentor_id,student_id",
        },
      );

      if (error) {
        Alert.alert("Ошибка", error.message);
        return;
      }

      setNotes(tempNotes);
      setIsEditingNotes(false);
      Alert.alert("Сохранено", "Заметки успешно обновлены");
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось сохранить заметки");
    }
  };

  const generateReport = async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      Alert.alert("Ошибка", "Не удалось создать отчёт");
      return;
    }

    try {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;

      const reportData = {
        sessions_count: 0,
        progress_percentage: student.progress,
        average_rating: null,
        skills: reportSkills.map((skill) => ({
          label: skill.label,
          value: skill.value,
        })),
        highlights: notes,
        areas_for_improvement: "",
      };

      const { error } = await supabase.from("mentor_monthly_reports").insert({
        mentor_id: user.id,
        student_id: student.id,
        parent_id: null, // TODO: Get parent_id from student profile
        report_month: monthKey,
        report_data: reportData,
        sent_to_parent: true,
        sent_at: new Date().toISOString(),
      });

      if (error) {
        Alert.alert("Ошибка", error.message);
        return;
      }

      // TODO: Send push notification to parent
      Alert.alert(
        "Отчёт создан",
        `Месячный отчёт за ${reportMonth} отправлен родителю`,
        [{ text: "OK", onPress: () => setShowReportModal(false) }],
      );
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось создать отчёт");
    }
  };

  return {
    notes,
    isEditingNotes,
    tempNotes,
    setTempNotes,
    showReportModal,
    setShowReportModal,
    reportMonth,
    startEditingNotes,
    cancelEditingNotes,
    saveNotes,
    generateReport,
    refreshNotes: loadNotes,
  };
}
