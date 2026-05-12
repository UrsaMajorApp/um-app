// useYouthEnrollmentRequests: загружает заявки ребенка/подростка на курсы и их статусы.
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { AuthUser } from '$contexts/AuthContext';
import type { PublicCourse } from '$hooks/usePublicData';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';
import type { Child } from '$types/child';

type EnrollmentRequestRow = {
  course_id: string;
};

type UseYouthEnrollmentRequestsParams = {
  user: AuthUser | null;
  activeChild: Child | undefined;
};

export function useYouthEnrollmentRequests({
  user,
  activeChild,
}: UseYouthEnrollmentRequestsParams) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);
  const [enrollmentRequested, setEnrollmentRequested] = useState<string[]>([]);

  const loadEnrollmentRequests = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setEnrollmentRequested([]);
      return;
    }

    try {
      const res = await supabase
        .from('student_enrollment_requests')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'pending');

      setEnrollmentRequested(rowsOrEmpty<EnrollmentRequestRow>(res).map((row) => row.course_id));
    } catch (error) {
      console.error('Error loading enrollment requests:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadEnrollmentRequests();
  }, [loadEnrollmentRequests]);

  const openEnrollmentModal = (course: PublicCourse) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const closeEnrollmentModal = () => {
    setShowEnrollModal(false);
  };

  const requestSelectedCourse = async () => {
    if (!selectedCourse) return;
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      Alert.alert('Ошибка', 'Не удалось отправить запрос');
      return;
    }

    try {
      const parentId =
        activeChild?.parentId && activeChild.parentId !== 'pending' ? activeChild.parentId : null;

      const { error } = await supabase.from('student_enrollment_requests').insert({
        student_id: user.id,
        student_name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
        parent_id: parentId,
        course_id: selectedCourse.id,
        course_title: selectedCourse.title,
        org_id: selectedCourse.org_id,
        org_name: selectedCourse.org_name,
        status: 'pending',
        notification_sent: false,
      });

      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      setEnrollmentRequested((prev) => [...prev, selectedCourse.id]);
      setShowEnrollModal(false);
      Alert.alert('Запрос отправлен!', 'Родитель получит уведомление и сможет подтвердить запись', [
        { text: 'OK' },
      ]);
    } catch (error: unknown) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось отправить запрос');
    }
  };

  return {
    showEnrollModal,
    selectedCourse,
    enrollmentRequested,
    openEnrollmentModal,
    closeEnrollmentModal,
    requestSelectedCourse,
    refreshEnrollmentRequests: loadEnrollmentRequests,
  };
}
