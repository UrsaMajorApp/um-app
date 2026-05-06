import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FEEDBACK_TAGS } from '$constants/feedback';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgApplications } from '$hooks/useOrgData';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function FeedbackFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { user } = useAuth();
  const { apps } = useOrgApplications();
  const student = apps.find((app) => app.id === id);

  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSave = async () => {
    if (!supabase || !isSupabaseConfigured || !student) return;
    await supabase.from('mentor_feedback').insert({
      mentor_user_id: user?.id ?? null,
      teacher_name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
      student_name: student.child_name,
      tag: selectedTags.join(', '),
      text: comment || `Оценка: ${rating}`,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      {/* Header - Unified Brand Style */}
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
                  marginBottom: SPACING.xl,
                }}
              >
                <TouchableOpacity
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
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: SPACING.md,
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                  }}
                >
                  Оставить отзыв
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: RADIUS.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SPACING.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <Feather name="user" size={28} color="white" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xxl,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: 'white',
                      marginBottom: 2,
                    }}
                  >
                    {student?.child_name || 'Ученик'}
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: TYPOGRAPHY.size.sm,
                      fontWeight: TYPOGRAPHY.weight.medium,
                    }}
                  >
                    {student?.club || 'Курс не указан'}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 150,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            ...SHADOWS.strict,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: SPACING.xl,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: COLORS.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: SPACING.lg,
            }}
          >
            Оценка за занятие
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                <Feather
                  name="star"
                  size={44}
                  color={star <= rating ? COLORS.accent : COLORS.muted}
                  fill={star <= rating ? COLORS.accent : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={{
            ...SHADOWS.strict,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: SPACING.xl,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: COLORS.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: SPACING.lg,
            }}
          >
            Быстрые теги
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    paddingHorizontal: SPACING.lg,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.full,
                    borderWidth: 1.5,
                    backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.1)' : COLORS.transparent,
                    borderColor: isSelected ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.sm,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: isSelected ? COLORS.primary : COLORS.mutedForeground,
                    }}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View
          style={{
            ...SHADOWS.strict,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: COLORS.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: SPACING.lg,
            }}
          >
            Комментарий для ИИ и Ментора
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Опишите, как проявил себя ученик на занятии..."
            multiline
            numberOfLines={4}
            style={{
              height: 140,
              textAlignVertical: 'top',
              backgroundColor: COLORS.background,
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              borderWidth: 1,
              borderColor: COLORS.border,
              color: COLORS.foreground,
              fontWeight: TYPOGRAPHY.weight.medium,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: COLORS.mutedForeground,
              marginTop: SPACING.md,
              fontWeight: TYPOGRAPHY.weight.medium,
              lineHeight: 16,
            }}
          >
            Ваш отзыв поможет ИИ точнее построить карту талантов для этого ребенка.
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: SPACING.xl,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          ...SHADOWS.lg,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={{
            ...SHADOWS.md,
            backgroundColor: COLORS.primary,
            borderRadius: RADIUS.lg,
            paddingVertical: SPACING.lg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: TYPOGRAPHY.weight.bold,
              fontSize: TYPOGRAPHY.size.lg,
            }}
          >
            Отправить отзыв
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
