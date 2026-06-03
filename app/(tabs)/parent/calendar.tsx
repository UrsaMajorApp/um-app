// Экран parent/calendar: загружает и показывает календарь занятий в кабинете родителя.
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { DAY_ALIASES, RUSSIAN_MONTHS, WEEKDAYS_SHORT } from '$constants/calendar';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { useParentCalendar } from '$hooks/useParentCalendar';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { CalendarDay } from '$types/calendar';

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days: CalendarDay[] = [];
  for (let i = 0; i < offset; i++) {
    days.push({ key: `empty-${year}-${month}-${i}`, value: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ key: `day-${year}-${month}-${i}`, value: i });
  }
  return days;
}

function scheduleMatchesDate(schedule: string | null, date: Date) {
  if (!schedule) return false;
  const normalized = schedule.toLowerCase().replace(/ё/g, 'е');
  const aliases = DAY_ALIASES[date.getDay()] ?? [];
  return aliases.some((alias) => new RegExp(`(^|[^а-яa-z])${alias}`, 'i').test(normalized));
}

function getScheduleTime(schedule: string | null) {
  if (!schedule) return 'Время уточняется';
  const match = schedule.match(/\d{1,2}:\d{2}(?:\s*[-–]\s*\d{1,2}:\d{2})?/);
  return match?.[0]?.replace(/\s+/g, ' ') ?? schedule;
}

export default function ParentCalendar() {
  const { user } = useAuth();
  const { childrenProfile, activeChildId } = useParentData();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const activeChild =
    childrenProfile.find((child) => child.id === activeChildId) || childrenProfile[0];
  const { enrollments, loading } = useParentCalendar(user?.id, activeChild);

  const days = getCalendarDays(currentDate.year, currentDate.month);
  const selectedDate = useMemo(
    () => new Date(currentDate.year, currentDate.month, selectedDay),
    [currentDate.month, currentDate.year, selectedDay],
  );
  const selectedEvents = useMemo(
    () => enrollments.filter((item) => scheduleMatchesDate(item.group_schedule, selectedDate)),
    [enrollments, selectedDate],
  );

  const shiftMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev.year, prev.month + delta);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Календарь"
        subtitle="Расписание занятий"
        paddingX={horizontalPadding}
        variant="dashboard"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-black">
            {RUSSIAN_MONTHS[currentDate.month]} {currentDate.year}
          </Text>
          <View className="flex-row gap-2">
            <PressableScale
              onPress={() => shiftMonth(-1)}
              className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center"
            >
              <Feather name="chevron-left" size={20} color="white" />
            </PressableScale>
            <PressableScale
              onPress={() => shiftMonth(1)}
              className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center"
            >
              <Feather name="chevron-right" size={20} color="white" />
            </PressableScale>
          </View>
        </View>
      </GradientScreenHeader>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 40,
          // On web, cap content width and center it so the calendar doesn't stretch
          maxWidth: isDesktop ? 600 : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
          width: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Grid */}
        <View
          style={{
            ...SHADOWS.md,
            backgroundColor: 'white',
            borderRadius: 32,
            padding: 20,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: '#F9FAFB',
          }}
        >
          {/* Weekday headers */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {WEEKDAYS_SHORT.map((d) => (
              <Text
                key={d}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: '900',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {d}
              </Text>
            ))}
          </View>
          {/* Day cells — fixed 40px height avoids giant cells on wide web */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map((day) => {
              const dayValue = day.value;
              const dayEventCount = dayValue
                ? enrollments.filter((item) =>
                    scheduleMatchesDate(
                      item.group_schedule,
                      new Date(currentDate.year, currentDate.month, dayValue),
                    ),
                  ).length
                : 0;

              return (
                <View
                  key={day.key}
                  style={{
                    width: '14.2857%',
                    height: 44,
                    padding: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {dayValue && (
                    <PressableScale
                      onPress={() => setSelectedDay(dayValue)}
                      style={() => ({
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                        backgroundColor: dayValue === selectedDay ? '#7C3AED' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 14,
                          color: dayValue === selectedDay ? 'white' : '#111827',
                        }}
                      >
                        {dayValue}
                      </Text>
                      {dayEventCount > 0 &&
                        dayValue !== selectedDay &&
                        (dayEventCount > 1 ? (
                          <View
                            style={{
                              position: 'absolute',
                              right: 4,
                              bottom: 3,
                              minWidth: 14,
                              height: 14,
                              borderRadius: 7,
                              backgroundColor: '#7C3AED',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingHorizontal: 3,
                            }}
                          >
                            <Text
                              style={{
                                color: 'white',
                                fontSize: 8,
                                fontWeight: '900',
                                fontVariant: ['tabular-nums'],
                              }}
                            >
                              {dayEventCount}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#7C3AED',
                            }}
                          />
                        ))}
                    </PressableScale>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <Text className="text-xl font-black text-gray-900 mb-4 px-1">
          Занятия на {selectedDay} {RUSSIAN_MONTHS[currentDate.month].toLowerCase()}
        </Text>

        {loading ? (
          <View className="bg-gray-50 rounded-[32px] p-10 items-center border border-gray-100">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : selectedEvents.length > 0 ? (
          <View style={{ gap: 12 }}>
            {selectedEvents.map((item) => (
              <View
                key={item.id}
                style={{
                  ...SHADOWS.sm,
                  backgroundColor: 'white',
                  borderRadius: 24,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      backgroundColor: `${COLORS.primary}12`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="book-open" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '900',
                        color: COLORS.foreground,
                      }}
                    >
                      {item.club ?? 'Занятие'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: COLORS.mutedForeground,
                        marginTop: 3,
                      }}
                    >
                      {item.group_name || 'Группа'} · {getScheduleTime(item.group_schedule)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-gray-50 rounded-[32px] p-10 items-center border border-gray-100">
            <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-4 border border-gray-100">
              <Feather name="coffee" size={28} color="#D1D5DB" />
            </View>
            <Text className="text-gray-400 font-bold text-center">
              На этот день ничего не запланировано
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
