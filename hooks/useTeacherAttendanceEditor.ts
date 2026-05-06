import { useCallback, useEffect, useState } from "react";
import type { TeacherAttendanceEntry } from "$hooks/usePlatformData";

export type TeacherAttendanceStatus = "present" | "absent";
export type TeacherAttendanceSelection = TeacherAttendanceStatus | null;

type AttendanceDraft = Record<string, TeacherAttendanceSelection>;
type AttendanceComments = Record<string, string>;

type SaveAttendance = (
  entries: Array<{
    studentId: string;
    status: TeacherAttendanceStatus;
    comment?: string | null;
  }>,
) => Promise<{ error: string | null }>;

export function useTeacherAttendanceEditor(
  savedAttendance: TeacherAttendanceEntry[],
  saveAttendance: SaveAttendance,
) {
  const [attendance, setAttendance] = useState<AttendanceDraft>({});
  const [comments, setComments] = useState<AttendanceComments>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextAttendance: AttendanceDraft = {};
    const nextComments: AttendanceComments = {};

    for (const entry of savedAttendance) {
      nextAttendance[entry.student_id] = entry.status;
      if (entry.comment) nextComments[entry.student_id] = entry.comment;
    }

    setAttendance(nextAttendance);
    setComments(nextComments);
  }, [savedAttendance]);

  const toggleStatus = useCallback(
    (studentId: string, status: TeacherAttendanceStatus) => {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: prev[studentId] === status ? null : status,
      }));
    },
    [],
  );

  const setStudentComment = useCallback((studentId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [studentId]: comment }));
  }, []);

  const submitAttendance = useCallback(
    async (options?: { includeComments?: boolean }) => {
      setSaving(true);
      const entries = Object.entries(attendance)
        .filter(
          (entry): entry is [string, TeacherAttendanceStatus] =>
            entry[1] !== null,
        )
        .map(([studentId, status]) => ({
          studentId,
          status,
          comment: options?.includeComments ? comments[studentId] ?? null : null,
        }));

      const result = await saveAttendance(entries);
      setSaving(false);
      return result;
    },
    [attendance, comments, saveAttendance],
  );

  return {
    attendance,
    comments,
    saving,
    hasAttendanceSelection: Object.keys(attendance).length > 0,
    toggleStatus,
    setStudentComment,
    submitAttendance,
  };
}
