// useParentProfileController: держит форму профиля родителя, выбранного ребенка, заявки и QR PIN actions.
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { AuthUser } from '$contexts/AuthContext';
import { formatPhone } from '$lib/formatPhone';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';
import type { Child } from '$types/child';

type ParentProfile = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  tariff?: 'basic' | 'pro';
} | null;

type ParentProfileEditForm = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type ParentEnrollmentRequest = {
  id: string;
  course_title: string | null;
  org_name: string | null;
  status: string | null;
  created_at: string | null;
};

type UseParentProfileControllerParams = {
  user: AuthUser | null;
  parentProfile: ParentProfile;
  children: Child[];
  updateParentProfile: (profile: Partial<ParentProfileEditForm>) => Promise<void>;
  updateChild: (childId: string, patch: Partial<Child>) => Promise<void>;
};

function generateQRPin(): string {
  // Шестизначный PIN нужен для быстрого входа ребенка по QR-сценарию.
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function useParentProfileController({
  user,
  parentProfile,
  children,
  updateParentProfile,
  updateChild,
}: UseParentProfileControllerParams) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [enrollments, setEnrollments] = useState<ParentEnrollmentRequest[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [editForm, setEditForm] = useState<ParentProfileEditForm>({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const selectedChild = children.find((child) => child.id === selectedChildId) || children[0];

  useEffect(() => {
    if (!parentProfile) return;

    // Когда профиль загрузился, переносим его в форму редактирования.
    // Форма живет локально, чтобы пользователь мог менять поля до сохранения.
    setEditForm({
      firstName: parentProfile.firstName || '',
      lastName: parentProfile.lastName || '',
      phone: parentProfile.phone || user?.phone || '',
    });
  }, [parentProfile, user?.phone]);

  useEffect(() => {
    if (children.length === 0) {
      setSelectedChildId(null);
      return;
    }

    // Если выбранный ребенок удалился или еще не выбран, берем первого из списка.
    if (!selectedChildId || !children.some((child) => child.id === selectedChildId)) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const fetchEnrollments = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) return;

    setLoadingEnrollments(true);
    try {
      // Заявки на курсы загружаются из Supabase по parent_id текущего пользователя.
      const res = await supabase
        .from('student_enrollment_requests')
        .select('id, course_title, org_name, status, created_at')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      setEnrollments(rowsOrEmpty<ParentEnrollmentRequest>(res));
      if (res.error) {
        console.error('Error fetching enrollments:', res.error.message);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedChild?.id) {
      fetchEnrollments();
    }
  }, [fetchEnrollments, selectedChild?.id]);

  const updateEditFormField = (field: keyof ParentProfileEditForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhone(value) : value,
    }));
  };

  const handleUpdateProfile = async () => {
    await updateParentProfile(editForm);
    setShowEditModal(false);
    Alert.alert('Успех', 'Профиль обновлен');
  };

  const handleGeneratePin = async () => {
    if (!selectedChild) return;

    const newPin = generateQRPin();
    // PIN живет 15 минут: этого хватает для демонстрации и снижает риск повторного входа.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await updateChild(selectedChild.id, {
      qrPin: newPin,
      qrPinExpiresAt: expiresAt.toISOString(),
      qrPinOneTimeUse: false,
    });
  };

  return {
    selectedChildId,
    setSelectedChildId,
    selectedChild,
    showQRModal,
    setShowQRModal,
    showEditModal,
    setShowEditModal,
    enrollments,
    loadingEnrollments,
    editForm,
    updateEditFormField,
    handleUpdateProfile,
    handleGeneratePin,
    refreshEnrollments: fetchEnrollments,
  };
}
