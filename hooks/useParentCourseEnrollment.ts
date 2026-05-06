import { useEffect, useState } from "react";
import { Alert } from "react-native";
import type { AuthUser } from "$contexts/AuthContext";
import type { Child } from "$types/child";
import type { OrgGroup } from "$hooks/useOrgData";
import {
  applyToCourse,
  applyToTrialLesson,
  checkEnrollment,
  type PublicCourse,
  type TrialLessonSlot,
} from "$hooks/usePublicData";

type EnrollmentType = "trial" | "full" | null;

type UseParentCourseEnrollmentParams = {
  course: PublicCourse | null;
  groups: OrgGroup[];
  trialSlots: TrialLessonSlot[];
  activeChild: Child | undefined;
  user: AuthUser | null;
};

export function useParentCourseEnrollment({
  course,
  groups,
  trialSlots,
  activeChild,
  user,
}: UseParentCourseEnrollmentParams) {
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [showEnrollmentChoice, setShowEnrollmentChoice] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      if (!course || !activeChild) {
        setCheckingEnrollment(false);
        return;
      }

      setCheckingEnrollment(true);
      const result = await checkEnrollment({
        childProfileId: activeChild.id,
        childName: activeChild.name,
        courseTitle: course.title,
        parentUserId: user?.id,
      });

      if (!cancelled) {
        setEnrolled(result.enrolled);
        setCheckingEnrollment(false);
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [course, activeChild, user?.id]);

  const openEnrollmentChoice = () => {
    setShowEnrollmentChoice(true);
  };

  const closeEnrollmentChoice = () => {
    setShowEnrollmentChoice(false);
    setEnrollmentType(null);
    setSelectedTimeSlot(null);
  };

  const selectTrial = () => {
    setEnrollmentType("trial");
  };

  const selectFullCourse = () => {
    setEnrollmentType("full");
    setShowEnrollmentChoice(false);
    setShowBookingModal(true);
  };

  const backFromTrial = () => {
    setEnrollmentType(null);
    setSelectedTimeSlot(null);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setEnrollmentType(null);
  };

  const confirmBooking = async () => {
    if (!course || !activeChild) return;

    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    setApplying(true);
    const result = await applyToCourse({
      orgId: course.org_id,
      courseTitle: course.title,
      childProfileId: activeChild.id,
      childName: activeChild.name,
      childAge: activeChild.age ?? null,
      parentUserId: user?.id,
      parentName: user
        ? `${user.firstName} ${user.lastName}`.trim()
        : undefined,
      groupId: selectedGroup?.id ?? null,
      groupName: selectedGroup?.name ?? null,
      groupSchedule: selectedGroup?.schedule ?? null,
    });
    setApplying(false);

    if (result.error) {
      Alert.alert("Ошибка", result.error);
      return;
    }

    setEnrolled(true);
    setShowBookingModal(false);
  };

  const confirmTrialLesson = async () => {
    if (!course || !activeChild || !selectedTimeSlot) return;

    setApplying(true);
    const selectedSlot = trialSlots.find((slot) => slot.id === selectedTimeSlot);
    if (!selectedSlot) {
      setApplying(false);
      return;
    }

    const day = selectedSlot.day_label;
    const time = selectedSlot.time_label;
    const result = await applyToTrialLesson({
      childId: activeChild.id,
      childName: activeChild.name,
      childAge: activeChild.age ?? null,
      parentId: user?.id,
      parentName: user ? `${user.firstName} ${user.lastName}`.trim() : undefined,
      orgId: course.org_id,
      courseId: course.id,
      courseTitle: course.title,
      requestedSlots: trialSlots.map((slot) => ({
        day: slot.day_label,
        time: slot.time_label,
      })),
      selectedSlot: { day, time },
    });
    setApplying(false);

    if (result.error) {
      Alert.alert("Ошибка", result.error);
      return;
    }

    setEnrolled(true);
    setShowEnrollmentChoice(false);
    setEnrollmentType(null);
    setSelectedTimeSlot(null);
    Alert.alert("Успешно!", `Пробный урок забронирован на ${day} в ${time}`);
  };

  return {
    enrolled,
    checkingEnrollment,
    showEnrollmentChoice,
    enrollmentType,
    showBookingModal,
    selectedGroupId,
    selectedTimeSlot,
    applying,
    openEnrollmentChoice,
    closeEnrollmentChoice,
    selectTrial,
    selectFullCourse,
    backFromTrial,
    closeBookingModal,
    setSelectedGroupId,
    setSelectedTimeSlot,
    confirmBooking,
    confirmTrialLesson,
  };
}
