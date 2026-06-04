// Parent route index: показывает основную страницу раздела менторов в отдельном parent-flow.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { requestParentMentor, useParentMentorRequests } from '$hooks/useParentMentorRequests';
import { usePublicMentors } from '$hooks/usePublicMentors';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function ParentMentorsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { user } = useAuth();
  const { childrenProfile, activeChildId, updateChild } = useParentData();
  const activeChild =
    childrenProfile.find((child) => child.id === activeChildId) || childrenProfile[0] || null;
  const { requests, refresh: refreshRequests } = useParentMentorRequests(
    user?.id,
    activeChild ?? undefined,
  );

  const { mentors: rawMentors, loading } = usePublicMentors();
  // Map to UI shape
  const mentors = rawMentors.map((m) => ({
    id: m.id,
    name: m.name ?? '—',
    specialization: m.specialization ?? '',
    rating: m.rating ?? 0,
    students: m.sessions ?? 0,
    tags: [] as string[],
    photo_url: m.photo_url,
    bio: m.bio,
  }));

  const chooseMentor = async (mentorId: string) => {
    if (!activeChild || !user?.id) {
      Alert.alert('Выберите ребенка', 'Сначала выберите профиль ребенка для записи к ментору.');
      return;
    }

    await updateChild(activeChild.id, { mentorApplicationId: mentorId });
    const { error } = await requestParentMentor({
      userId: user.id,
      child: activeChild,
      mentorApplicationId: mentorId,
    });

    if (error) {
      Alert.alert('Не удалось отправить заявку', error);
      return;
    }

    await refreshRequests();
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
            <View style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <PressableScale
                  onPress={() => router.back()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </PressableScale>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: 'white',
                  }}
                >
                  Выбор Ментора
                </Text>
              </View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                Выберите наставника-сопровождающего, который поможет раскрыть потенциал вашего
                ребенка и будет отслеживать его прогресс.
              </Text>
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
        {loading && (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 40,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        <View style={{ gap: SPACING.lg }}>
          {mentors.map((mentor, idx) => (
            <MotiView
              key={mentor.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 100 }}
            >
              <View
                style={{
                  ...SHADOWS.strict,
                  backgroundColor: COLORS.white,
                  borderRadius: 32,
                  padding: SPACING.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 24,
                      backgroundColor: `${COLORS.primary}10`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {mentor.photo_url ? (
                      <Image
                        source={{ uri: mentor.photo_url }}
                        resizeMode="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 30,
                          fontWeight: '700',
                          color: COLORS.primary,
                        }}
                      >
                        {mentor.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: COLORS.foreground,
                        marginBottom: 4,
                      }}
                    >
                      {mentor.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.mutedForeground,
                        fontWeight: '600',
                        marginBottom: 8,
                      }}
                    >
                      {mentor.specialization}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Feather name="star" size={12} color="#F59E0B" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: COLORS.foreground,
                          }}
                        >
                          {mentor.rating}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Feather name="users" size={12} color={COLORS.mutedForeground} />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: COLORS.foreground,
                          }}
                        >
                          {mentor.students} учеников
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {mentor.tags.map((tag) => (
                    <View
                      key={tag}
                      style={{
                        backgroundColor: 'rgba(108, 92, 231, 0.08)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.primary,
                          fontSize: 10,
                          fontWeight: '800',
                          textTransform: 'uppercase',
                        }}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <PressableScale
                    style={{
                      flex: 1,
                      height: 48,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.foreground,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 13,
                      }}
                    >
                      ПРОФИЛЬ
                    </Text>
                  </PressableScale>
                  {(() => {
                    const selected = activeChild?.mentorApplicationId === mentor.id;
                    const request = requests.find(
                      (item) => item.mentor_application_id === mentor.id,
                    );
                    return (
                      <PressableScale
                        onPress={() => chooseMentor(mentor.id)}
                        disabled={Boolean(request)}
                        style={{
                          flex: 1.5,
                          height: 48,
                          backgroundColor: request ? '#D1FAE5' : COLORS.primary,
                          borderRadius: RADIUS.lg,
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...SHADOWS.md,
                        }}
                      >
                        <Text
                          style={{
                            color: request ? '#047857' : 'white',
                            fontWeight: TYPOGRAPHY.weight.bold,
                            fontSize: 13,
                          }}
                        >
                          {request ? 'ЗАЯВКА ОТПРАВЛЕНА' : selected ? 'ЗАПИСАТЬСЯ' : 'ВЫБРАТЬ'}
                        </Text>
                      </PressableScale>
                    );
                  })()}
                </View>
              </View>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
