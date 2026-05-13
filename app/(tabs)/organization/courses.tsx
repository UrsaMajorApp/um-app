// Экран organization/courses: загружает и показывает курсы организации в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgCourses, useOrgGroups } from '$hooks/useOrgData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { useIsDesktop } from '$lib/useIsDesktop';
import type { WebTextStyle } from '$types/styles';

export default function OrgCourses() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { user } = useAuth();

  const { courses, loading } = useOrgCourses();
  const { groups } = useOrgGroups();

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Compute student count per course from groups linked by course_id
  const studentCountByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of groups) {
      if (g.course_id) {
        map[g.course_id] = (map[g.course_id] ?? 0) + g.enrolled;
      }
    }
    return map;
  }, [groups]);

  const filtered = useMemo(
    () => courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search],
  );

  const totalStudents = useMemo(
    () => Object.values(studentCountByCourse).reduce((s, n) => s + n, 0),
    [studentCountByCourse],
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Курсы"
        subtitle={`${courses.length} курсов`}
        paddingX={paddingX}
        variant="dashboard"
        rightAccessory={
          <PressableScale
            onPress={() => navigateApp(router, user?.role, { name: 'orgCourseCreate' })}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: SPACING.lg,
              height: 44,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: TYPOGRAPHY.weight.bold,
                fontSize: 13,
              }}
            >
              + Добавить
            </Text>
          </PressableScale>
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: searchFocused ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.15)',
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.lg,
            height: 52,
            borderWidth: 1,
            borderColor: searchFocused ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.2)',
            boxShadow: searchFocused ? '0 0 0 3px rgba(255,255,255,0.16)' : 'none',
          }}
        >
          <Feather
            name="search"
            size={18}
            color="rgba(255,255,255,0.6)"
            style={{ marginRight: SPACING.sm }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Поиск курса..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            className="outline-none"
            style={
              {
                color: 'white',
                flex: 1,
                fontSize: 16,
                fontWeight: TYPOGRAPHY.weight.medium,
                outlineWidth: 0,
              } satisfies WebTextStyle
            }
          />
        </View>
      </GradientScreenHeader>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary tiles */}
        <View
          style={{
            flexDirection: 'row',
            gap: SPACING.md,
            marginBottom: SPACING.xxl,
          }}
        >
          <View
            style={{
              ...SHADOWS.strict,
              flex: 1,
              backgroundColor: COLORS.white,
              padding: SPACING.xl,
              borderRadius: RADIUS.xxl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.primary,
              }}
            >
              {courses.length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              Курсов
            </Text>
          </View>
          <View
            style={{
              ...SHADOWS.strict,
              flex: 1,
              backgroundColor: COLORS.white,
              padding: SPACING.xl,
              borderRadius: RADIUS.xxl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              {totalStudents}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              Учеников
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 40 }} />
        )}

        {/* Empty state */}
        {!loading && courses.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.muted,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Feather name="book-open" size={32} color={COLORS.mutedForeground} />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                marginBottom: 8,
              }}
            >
              Курсов пока нет
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.mutedForeground,
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Создайте первый курс, чтобы начать набор учеников
            </Text>
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgCourseCreate' })}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: RADIUS.lg,
                ...SHADOWS.md,
              }}
            >
              <Text style={{ color: 'white', fontWeight: TYPOGRAPHY.weight.bold }}>
                Создать курс
              </Text>
            </PressableScale>
          </View>
        )}

        {/* Courses list */}
        {!loading && filtered.length > 0 && (
          <View style={{ gap: SPACING.lg }}>
            {filtered.map((course, idx) => {
              const students = studentCountByCourse[course.id] ?? 0;
              return (
                <MotiView
                  key={course.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: idx * 80 }}
                >
                  <PressableScale
                    onPress={() =>
                      navigateApp(router, user?.role, {
                        name: 'orgCourseDetails',
                        courseId: course.id,
                      })
                    }
                    style={{
                      ...SHADOWS.strict,
                      backgroundColor: COLORS.white,
                      borderRadius: 40,
                      padding: SPACING.xl,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: SPACING.xl,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: SPACING.lg,
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: RADIUS.xl,
                            backgroundColor: 'rgba(108, 92, 231, 0.05)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Feather
                            name={featherIconName(course.icon, 'book-open')}
                            size={28}
                            color={COLORS.primary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.size.xl,
                              fontWeight: TYPOGRAPHY.weight.semibold,
                              color: COLORS.foreground,
                            }}
                          >
                            {course.title}
                          </Text>
                          {course.age_min || course.age_max ? (
                            <Text
                              style={{
                                fontSize: TYPOGRAPHY.size.sm,
                                color: COLORS.mutedForeground,
                                fontWeight: TYPOGRAPHY.weight.medium,
                              }}
                            >
                              {course.age_min ?? ''}–{course.age_max ?? ''} лет
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: RADIUS.lg,
                          backgroundColor:
                            course.status === 'active'
                              ? 'rgba(52, 199, 89, 0.1)'
                              : COLORS.background,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: TYPOGRAPHY.weight.bold,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color:
                              course.status === 'active' ? COLORS.success : COLORS.mutedForeground,
                          }}
                        >
                          {course.status === 'active'
                            ? 'Активен'
                            : course.status === 'draft'
                              ? 'На модерации'
                              : 'Архив'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Feather name="users" size={14} color={COLORS.mutedForeground} />
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.size.xs,
                              fontWeight: TYPOGRAPHY.weight.semibold,
                              color: COLORS.mutedForeground,
                            }}
                          >
                            {students} учеников
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.xl,
                            fontWeight: TYPOGRAPHY.weight.bold,
                            color: COLORS.primary,
                          }}
                        >
                          {formatKZT(course.price)}/МЕС
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                        <PressableScale
                          onPress={() =>
                            navigateApp(router, user?.role, {
                              name: 'orgCourseEdit',
                              courseId: course.id,
                            })
                          }
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: COLORS.background,
                            borderRadius: RADIUS.lg,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Feather name="edit-2" size={16} color={COLORS.mutedForeground} />
                        </PressableScale>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: COLORS.primary,
                            borderRadius: RADIUS.lg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...SHADOWS.md,
                          }}
                        >
                          <Feather name="chevron-right" size={20} color="white" />
                        </View>
                      </View>
                    </View>
                  </PressableScale>
                </MotiView>
              );
            })}
          </View>
        )}

        {/* No search results */}
        {!loading && courses.length > 0 && filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text
              style={{
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.semibold,
              }}
            >
              Ничего не найдено
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
