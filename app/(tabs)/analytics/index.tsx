import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RUSSIAN_CALENDAR_LOCALE, RUSSIAN_GENITIVE_MONTHS } from '$constants/calendar';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';
import { useOrgSchedule } from '$hooks/useOrgData';
import { isWebMinWidth } from '$lib/useIsDesktop';

LocaleConfig.locales.ru = RUSSIAN_CALENDAR_LOCALE;
LocaleConfig.defaultLocale = 'ru';

/** JS getDay() returns 0=Sun…6=Sat. Convert to Mon=0…Sun=6 used in DB. */
function jsDayToDow(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${RUSSIAN_GENITIVE_MONTHS[(m || 1) - 1]} ${y}`;
}

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();
  const IS_DESKTOP = isWebMinWidth(width, 900);
  const today = new Date();
  const initialDate = today.toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Derive day-of-week (Mon=0) from selected date
  const selectedDow = useMemo(() => {
    const d = new Date(selectedDate);
    return jsDayToDow(d.getDay());
  }, [selectedDate]);

  const { items, loading } = useOrgSchedule(selectedDow);

  // Mark every date in a ±60-day window that falls on an active day_of_week
  const markedDates = useMemo(() => {
    // For marking the calendar, we use a separate "all items" set — see note below.
    // Since useOrgSchedule filters by dayOfWeek, we can't know which OTHER days have events.
    // Instead, mark the selected date and trust the user to explore.
    const marked: Record<
      string,
      {
        selected: boolean;
        selectedColor: string;
        selectedTextColor: string;
      }
    > = {};
    marked[selectedDate] = {
      selected: true,
      selectedColor: COLORS.primary,
      selectedTextColor: 'white',
    };
    return marked;
  }, [selectedDate]);

  const dayEvents = items;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 120,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              maxWidth: IS_DESKTOP ? 600 : undefined,
              alignSelf: IS_DESKTOP ? 'center' : undefined,
              width: '100%',
            }}
          >
            {/* Header */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: COLORS.foreground,
                marginBottom: 16,
              }}
            >
              Календарь
            </Text>

            {/* Calendar Card */}
            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.lg,
                padding: 8,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
                ...SHADOWS.md,
              }}
            >
              <Calendar
                current={initialDate}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                firstDay={1}
                enableSwipeMonths
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: COLORS.mutedForeground,
                  monthTextColor: COLORS.foreground,
                  arrowColor: COLORS.primary,
                  todayTextColor: COLORS.primary,
                  dayTextColor: COLORS.foreground,
                  textDayFontSize: 14,
                  textMonthFontSize: 18,
                  textMonthFontWeight: '700',
                  textDayHeaderFontSize: 12,
                }}
                style={{ borderRadius: 20 }}
              />
            </View>

            {/* Events Card */}
            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.lg,
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                ...SHADOWS.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: COLORS.foreground,
                  }}
                >
                  {formatDate(selectedDate)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="calendar" size={14} color={COLORS.mutedForeground} />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 13,
                      color: COLORS.mutedForeground,
                    }}
                  >
                    {loading
                      ? '...'
                      : dayEvents.length
                        ? `${dayEvents.length} занятия`
                        : 'нет занятий'}
                  </Text>
                </View>
              </View>

              {!loading && dayEvents.length === 0 && (
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.mutedForeground,
                    paddingVertical: 8,
                  }}
                >
                  На выбранную дату занятий пока нет.
                </Text>
              )}

              {dayEvents.map((e) => (
                <View
                  key={e.id}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: e.color || COLORS.primary,
                      marginRight: 12,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.mutedForeground,
                        marginBottom: 2,
                      }}
                    >
                      {e.time_label}
                      {e.room ? ` · ${e.room}` : ''}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: COLORS.foreground,
                      }}
                    >
                      {e.subject}
                    </Text>
                    {e.group_name ? (
                      <Text style={{ fontSize: 12, color: COLORS.mutedForeground }}>
                        {e.group_name}
                        {e.teacher_name ? ` · ${e.teacher_name}` : ''}
                      </Text>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={18} color={COLORS.mutedForeground} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
