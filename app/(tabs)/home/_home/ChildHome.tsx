// ChildHome: собирает виджеты и быстрые действия домашнего экрана для роли child.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { EnrollmentRequestModal } from '$components/home/youth/EnrollmentRequestModal';
import { YouthPassModal } from '$components/home/youth/YouthPassModal';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { courseGradient, usePublicCourses } from '$hooks/usePublicData';
import { useYouthEnrollmentRequests } from '$hooks/useYouthEnrollmentRequests';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { appHref } from '$lib/router';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function ChildHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { childrenProfile, activeChildId } = useParentData();
  const activeChild = childrenProfile.find((child) => child.id === activeChildId);
  const profileName = activeChild?.name || user?.firstName || 'Друг';
  const diagnostic = activeChild?.talentProfile;
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const [passVisible, setPassVisible] = useState(false);
  const { courses } = usePublicCourses();
  const enrollmentRequests = useYouthEnrollmentRequests({ user, activeChild });

  const topSkills = useMemo(() => {
    if (!diagnostic?.scores) return [];
    return Object.entries(diagnostic.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [diagnostic]);

  const qrValue = `um:pass:${user?.id ?? activeChild?.id ?? 'guest'}:${profileName}`;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <GradientScreenHeader
          title={`Привет, ${profileName}!`}
          subtitle="Детский кабинет"
          paddingX={horizontalPadding}
          variant="dashboard"
        />

        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 24, gap: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PressableScale
              onPress={() => setPassVisible(true)}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 18,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#EEF2FF',
                ...SHADOWS.sm,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: '#FDF2F8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Feather name="maximize" size={22} color="#EC4899" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.foreground }}>
                МОЙ ПРОПУСК
              </Text>
            </PressableScale>

            <PressableScale
              onPress={() => router.push(appHref('/(tabs)/youth/games'))}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 18,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#EEF2FF',
                ...SHADOWS.sm,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: '#ECFDF5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Feather name="layout" size={22} color="#10B981" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.foreground }}>
                ИГРЫ
              </Text>
            </PressableScale>
          </View>

          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 28,
              padding: 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              ...SHADOWS.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="star" size={18} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.foreground }}>
                Мои суперсилы
              </Text>
            </View>

            {diagnostic ? (
              <View style={{ gap: 10 }}>
                <Text style={{ color: '#4B5563', fontSize: 13, lineHeight: 18 }}>
                  {diagnostic.recommendedConstellation || 'Профиль готов'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {topSkills.map(([skill, value]) => (
                    <View
                      key={skill}
                      style={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                      }}
                    >
                      <Text style={{ color: '#374151', fontSize: 12, fontWeight: '800' }}>
                        {skill}: {value}%
                      </Text>
                    </View>
                  ))}
                </View>
                <PressableScale
                  onPress={() => router.push('/profile/youth/results')}
                  style={{
                    marginTop: 4,
                    backgroundColor: COLORS.primary,
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '900' }}>Посмотреть карту</Text>
                </PressableScale>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 18 }}>
                  Пройди короткую диагностику, чтобы узнать свои сильные стороны.
                </Text>
                <PressableScale
                  onPress={() => router.push('/profile/youth/testing')}
                  style={{
                    backgroundColor: '#EEF2FF',
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: '900' }}>Начать тест</Text>
                </PressableScale>
              </View>
            )}
          </View>

          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '900',
                color: COLORS.foreground,
                marginBottom: 12,
              }}
            >
              Кружки
            </Text>
            {courses.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 24,
                  padding: 24,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#EEF2F7',
                }}
              >
                <Feather name="book-open" size={26} color="#CBD5E1" />
                <Text style={{ marginTop: 10, color: '#94A3B8', fontWeight: '800' }}>
                  Кружки скоро появятся
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courses.slice(0, 4).map((course, index) => (
                  <PressableScale
                    key={course.id}
                    onPress={() => enrollmentRequests.openEnrollmentModal(course)}
                    style={{ width: 190, marginRight: 14, ...SHADOWS.sm }}
                  >
                    <LinearGradient
                      colors={courseGradient(index)}
                      style={{ borderRadius: 22, minHeight: 150, padding: 16 }}
                    >
                      <Feather
                        name={featherIconName(course.icon, 'book-open')}
                        size={26}
                        color="white"
                      />
                      <View style={{ marginTop: 'auto' }}>
                        <Text
                          style={{ color: 'white', fontSize: 15, fontWeight: '900' }}
                          numberOfLines={2}
                        >
                          {course.title}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11 }}>
                          {formatKZT(course.price)}/мес
                        </Text>
                      </View>
                    </LinearGradient>
                  </PressableScale>
                ))}
              </ScrollView>
            )}
          </View>

        </View>
      </ScrollView>

      <YouthPassModal
        visible={passVisible}
        qrValue={qrValue}
        userName={profileName}
        onClose={() => setPassVisible(false)}
      />

      <EnrollmentRequestModal
        visible={enrollmentRequests.showEnrollModal}
        selectedCourse={enrollmentRequests.selectedCourse}
        enrollmentRequested={enrollmentRequests.enrollmentRequested}
        requiresParentApproval={enrollmentRequests.requiresParentApproval}
        onClose={enrollmentRequests.closeEnrollmentModal}
        onRequestEnrollment={enrollmentRequests.requestSelectedCourse}
      />
    </View>
  );
}
