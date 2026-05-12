// Organization route attendance: показывает детали записи для сущности группу в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useOrgApplications, useOrgGroupById } from '$hooks/useOrgData';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { AttendanceStatus, AttendanceStudentRow } from '$types/attendance';

export default function AttendanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const date = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  const { group } = useOrgGroupById(id);
  const { apps, loading } = useOrgApplications();

  const [students, setStudents] = useState<AttendanceStudentRow[]>([]);

  useEffect(() => {
    const enrolled = apps.filter(
      (a) =>
        ['paid', 'activated'].includes(a.status) && (!group?.course || a.club === group.course),
    );
    setStudents(
      enrolled.map((a) => ({
        id: a.id,
        name: a.child_name,
        age: a.child_age,
        status: null,
      })),
    );
  }, [apps, group]);

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const handleSave = () => {
    const unmarked = students.filter((s) => s.status === null).length;
    if (unmarked > 0) {
      Alert.alert('Не все отмечены', `${unmarked} ученика(ов) без статуса. Сохранить всё равно?`, [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сохранить', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Готово', 'Посещаемость сохранена!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: 'hidden',
        }}
      >
        <LinearGradient colors={COLORS.gradients.header} style={{ paddingBottom: SPACING.xl }}>
          <SafeAreaView edges={['top']}>
            <View
              style={{
                paddingHorizontal: horizontalPadding,
                paddingTop: SPACING.md,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: SPACING.xl,
                }}
              >
                <PressableScale
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </PressableScale>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: SPACING.md,
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                  }}
                >
                  Отметка посещаемости
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: 'white',
                    marginBottom: 4,
                  }}
                >
                  {group?.name ?? 'Группа'}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: TYPOGRAPHY.size.sm,
                    fontWeight: TYPOGRAPHY.weight.medium,
                  }}
                >
                  Сегодня, {date}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.foreground,
              marginBottom: 4,
            }}
          >
            Список учеников
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.mutedForeground }}>
            Отметьте присутствие или причину отсутствия.
          </Text>
        </View>

        {loading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        )}

        {!loading && students.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Feather name="users" size={36} color={COLORS.muted} />
            <Text
              style={{
                marginTop: 12,
                color: COLORS.mutedForeground,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Нет зачисленных учеников в этой группе
            </Text>
          </View>
        )}

        <View style={{ gap: 12 }}>
          {students.map((student) => (
            <View
              key={student.id}
              style={{
                ...SHADOWS.sm,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                  marginBottom: SPACING.lg,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Feather name="user" size={18} color={COLORS.mutedForeground} />
                </View>
                <View>
                  <Text
                    style={{
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: COLORS.foreground,
                      fontSize: 16,
                    }}
                  >
                    {student.name}
                  </Text>
                  {student.age && (
                    <Text style={{ fontSize: 12, color: COLORS.mutedForeground }}>
                      {student.age} лет
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(
                  [
                    { key: 'present', label: 'Был', color: '#22C55E' },
                    { key: 'absent', label: 'Не был', color: '#EF4444' },
                    { key: 'sick', label: 'Болел', color: '#F59E0B' },
                  ] as const
                ).map(({ key, label, color }) => {
                  const active = student.status === key;
                  return (
                    <PressableScale
                      key={key}
                      onPress={() => toggleStatus(student.id, key)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: RADIUS.lg,
                        borderWidth: 2,
                        backgroundColor: active ? color : 'transparent',
                        borderColor: active ? color : COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: active ? 'white' : COLORS.mutedForeground,
                          fontSize: 13,
                        }}
                      >
                        {label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopWidth: 1,
          borderColor: COLORS.border,
          ...SHADOWS.lg,
        }}
      >
        <PressableScale
          onPress={handleSave}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: RADIUS.lg,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: TYPOGRAPHY.weight.bold,
              fontSize: 16,
            }}
          >
            Сохранить
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
