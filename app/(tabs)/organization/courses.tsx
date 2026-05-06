import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { appHref } from '$lib/router';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useOrgCourses, useOrgGroups } from '$hooks/useOrgData';
import { featherIconName } from '$lib/icons';
import { formatKZT } from '$lib/formatCurrency';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function OrgCourses() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;

  const { courses, loading } = useOrgCourses();
  const { groups } = useOrgGroups();

  const [search, setSearch] = useState('');

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
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, overflow: 'hidden' }}>
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 0 : 20 }}
        >
          <SafeAreaView edges={['top']}>
            <View
              style={{
                paddingHorizontal: paddingX,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: SPACING.xl,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                    flex: 1,
                  }}
                >
                  Курсы
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/organization/course/create')}
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
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: RADIUS.lg,
                  paddingHorizontal: SPACING.lg,
                  height: 52,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
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
                  placeholder="Поиск курса..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={{
                    color: 'white',
                    flex: 1,
                    fontSize: 16,
                    fontWeight: TYPOGRAPHY.weight.medium,
                  }}
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

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
            <TouchableOpacity
              onPress={() => router.push('/organization/course/create')}
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
            </TouchableOpacity>
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
                  <TouchableOpacity
                    onPress={() => router.push(appHref(`/organization/course/${course.id}`))}
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
                        <TouchableOpacity
                          onPress={() =>
                            router.push(appHref(`/organization/course/${course.id}/edit`))
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
                        </TouchableOpacity>
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
                  </TouchableOpacity>
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
