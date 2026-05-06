import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { appHref } from '$lib/router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '$constants/theme';
import { useParentData } from '$contexts/ParentDataContext';
import { courseGradient, SCORE_TO_SKILLS, usePublicCourses } from '$hooks/usePublicData';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

// Skill-based filter chips shown in the catalog
const SKILL_FILTERS = [
  'Все',
  'Код',
  'Логика',
  'Математика',
  'Дизайн',
  'Языки',
  'Команда',
  'Креативность',
];

export default function ParentClubs() {
  const router = useRouter();
  const { childrenProfile, activeChildId } = useParentData();
  const [activeSkill, setActiveSkill] = useState('Все');
  const [search, setSearch] = useState('');
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const { courses, loading } = usePublicCourses();

  const activeChild = childrenProfile.find((c) => c.id === activeChildId) || childrenProfile[0];

  // ── AI recommendations based on talent profile ──────────────────────────────
  const recommendedCourses = useMemo(() => {
    if (!activeChild?.talentProfile || courses.length === 0) return [];
    const scores = activeChild.talentProfile.scores as Record<string, number>;
    const topTraits = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([trait]) => trait);

    const wantedSkills = new Set(topTraits.flatMap((t) => SCORE_TO_SKILLS[t] ?? []));

    return courses.filter((c) => c.skills.some((s) => wantedSkills.has(s))).slice(0, 5);
  }, [activeChild, courses]);

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const matchSkill = activeSkill === 'Все' || c.skills.includes(activeSkill);
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
        return matchSkill && matchSearch;
      }),
    [courses, activeSkill, search],
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
                paddingHorizontal: horizontalPadding,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: 'white',
                    flex: 1,
                  }}
                >
                  Каталог кружков
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {courses.length > 0 ? `${courses.length} курсов` : ''}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Feather
                  name="search"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Найти кружок..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={{ flex: 1, color: 'white', fontWeight: '500' }}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')}>
                    <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                )}
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
        {/* Skill filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24, marginHorizontal: -4 }}
        >
          {SKILL_FILTERS.map((skill) => (
            <Pressable
              key={skill}
              onPress={() => setActiveSkill(skill)}
              style={{
                marginRight: 10,
                paddingHorizontal: 20,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1,
                backgroundColor: activeSkill === skill ? '#6C5CE7' : 'white',
                borderColor: activeSkill === skill ? '#6C5CE7' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 13,
                  color: activeSkill === skill ? 'white' : '#6B7280',
                }}
              >
                {skill}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="large" color="#6C5CE7" style={{ marginVertical: 60 }} />
        )}

        {/* Empty DB state */}
        {!loading && courses.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Feather name="inbox" size={48} color="#E5E7EB" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: '800',
                color: '#1F2937',
                textAlign: 'center',
              }}
            >
              Курсов пока нет
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Организации ещё не добавили курсы.{'\n'}Загляните позже.
            </Text>
          </View>
        )}

        {/* AI Recommendations */}
        {!loading &&
          activeChild?.talentProfile &&
          recommendedCourses.length > 0 &&
          search === '' &&
          activeSkill === 'Все' && (
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                  paddingHorizontal: 4,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#EDE9FE',
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="zap" size={16} color="#6C5CE7" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '900',
                      color: '#111827',
                    }}
                  >
                    Идеально для {activeChild.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: '#6C5CE7',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Подобрано ИИ · Карта Талантов
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -4 }}
              >
                {recommendedCourses.map((club, idx) => {
                  const grad = courseGradient(idx);
                  return (
                    <Pressable
                      key={club.id}
                      onPress={() => router.push(appHref(`/parent/club/${club.id}`))}
                      style={[
                        SHADOWS.md,
                        {
                          marginRight: 16,
                          width: 220,
                          backgroundColor: 'white',
                          borderRadius: 28,
                          padding: 4,
                          borderWidth: 1,
                          borderColor: '#EDE9FE',
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={grad}
                        style={{
                          height: 110,
                          borderRadius: 24,
                          padding: 12,
                          justifyContent: 'space-between',
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            alignSelf: 'flex-start',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 9,
                              fontWeight: '900',
                              textTransform: 'uppercase',
                            }}
                          >
                            Мастхэв
                          </Text>
                        </View>
                        <Feather
                          name={featherIconName(club.icon, 'star')}
                          size={30}
                          color="rgba(255,255,255,0.8)"
                          style={{ alignSelf: 'flex-end' }}
                        />
                      </LinearGradient>
                      <View style={{ padding: 12 }}>
                        <Text
                          style={{
                            fontWeight: '800',
                            fontSize: 14,
                            color: '#111827',
                            marginBottom: 2,
                          }}
                          numberOfLines={1}
                        >
                          {club.title}
                        </Text>
                        {club.org_name ? (
                          <Text
                            style={{
                              fontSize: 11,
                              color: '#9CA3AF',
                              fontWeight: '600',
                              marginBottom: 8,
                            }}
                            numberOfLines={1}
                          >
                            {club.org_name}
                          </Text>
                        ) : null}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: '#6C5CE7',
                              fontWeight: '900',
                              fontSize: 13,
                            }}
                          >
                            {formatKZT(club.price)}
                          </Text>
                          <View
                            style={{
                              backgroundColor: '#F9FAFB',
                              padding: 6,
                              borderRadius: 999,
                            }}
                          >
                            <Feather name="arrow-right" size={13} color="#6B7280" />
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

        {/* All courses list */}
        {!loading && courses.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '900',
                color: '#111827',
                marginBottom: 16,
                paddingHorizontal: 4,
              }}
            >
              {search
                ? 'Результаты поиска'
                : activeSkill === 'Все'
                  ? 'Все кружки'
                  : `Навык: ${activeSkill}`}
            </Text>

            <View style={{ gap: 12 }}>
              {filtered.map((club, idx) => {
                const [color] = courseGradient(idx);
                return (
                  <Pressable
                    key={club.id}
                    onPress={() => router.push(appHref(`/parent/club/${club.id}`))}
                    style={[
                      SHADOWS.sm,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        backgroundColor: 'white',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#F9FAFB',
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        backgroundColor: `${color}15`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                      }}
                    >
                      <Feather
                        name={featherIconName(club.icon, 'book-open')}
                        size={24}
                        color={color}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: '800',
                          fontSize: 15,
                          color: '#111827',
                        }}
                        numberOfLines={1}
                      >
                        {club.title}
                      </Text>
                      {club.org_name ? (
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            fontWeight: '600',
                            marginTop: 1,
                          }}
                          numberOfLines={1}
                        >
                          {club.org_name}
                        </Text>
                      ) : null}
                      {club.skills.length > 0 && (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 4,
                            marginTop: 5,
                            flexWrap: 'wrap',
                          }}
                        >
                          {club.skills.slice(0, 3).map((s) => (
                            <View
                              key={s}
                              style={{
                                backgroundColor: `${color}15`,
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '800',
                                  color,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {s}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                      <Text
                        style={{
                          color: '#6C5CE7',
                          fontWeight: '900',
                          fontSize: 13,
                        }}
                        numberOfLines={1}
                      >
                        {formatKZT(club.price)}
                      </Text>
                      {club.age_min || club.age_max ? (
                        <Text
                          style={{
                            fontSize: 10,
                            color: '#9CA3AF',
                            fontWeight: '700',
                            marginTop: 2,
                          }}
                        >
                          {club.age_min ?? ''}–{club.age_max ?? ''} лет
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Feather name="search" size={40} color="#E5E7EB" />
                <Text
                  style={{
                    marginTop: 12,
                    color: '#9CA3AF',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Ничего не найдено
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
