import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FormCard } from '$components/ui/form/FormCard';
import { LabeledTextInput } from '$components/ui/form/LabeledTextInput';
import { PrimaryActionButton } from '$components/ui/form/PrimaryActionButton';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import {
  ICON_OPTIONS,
  LEVEL_OPTIONS,
  type CourseLevel as Level,
  SKILL_OPTIONS,
} from '$constants/courseOptions';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useOrgCourses } from '$hooks/useOrgData';
import { appHref } from '$lib/router';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function CreateCourseScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;

  const { createCourse } = useOrgCourses();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState<Level>('beginner');
  const [icon, setIcon] = useState('book');
  const [skills, setSkills] = useState<string[]>([]);

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const result = await createCourse({
      title: title.trim(),
      description: description.trim() || undefined,
      level,
      price: parseInt(price, 10) || 0,
      icon,
      skills,
      status: 'active',
    });
    setLoading(false);

    if (result.error) {
      Alert.alert('Ошибка', result.error);
      return;
    }

    if (result.data?.id) {
      router.replace(appHref(`/organization/course/${result.data.id}`));
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader title="Создать курс" paddingX={paddingX} onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingTop: SPACING.xl,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            {/* Main fields */}
            <FormCard style={{ gap: SPACING.xl }}>
              <LabeledTextInput
                label="Название курса *"
                placeholder="Напр. Робототехника"
                value={title}
                onChangeText={setTitle}
              />

              <LabeledTextInput
                label="Описание"
                placeholder="О чём этот курс..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                inputStyle={{
                  height: undefined,
                  minHeight: 120,
                  paddingVertical: 12,
                }}
              />

              <LabeledTextInput
                label="Цена (₸/мес)"
                placeholder="0"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </FormCard>

            {/* Level selector */}
            <FormCard style={{ marginTop: SPACING.xl }}>
              <Text style={labelStyle}>Уровень</Text>
              <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 8 }}>
                {LEVEL_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLevel(opt.value)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      backgroundColor: level === opt.value ? COLORS.primary : COLORS.background,
                      borderWidth: 1,
                      borderColor: level === opt.value ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: level === opt.value ? 'white' : COLORS.mutedForeground,
                      }}
                    >
                      {opt.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FormCard>

            {/* Icon picker */}
            <FormCard style={{ marginTop: SPACING.xl }}>
              <Text style={labelStyle}>Иконка курса</Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: SPACING.sm,
                  marginTop: 8,
                }}
              >
                {ICON_OPTIONS.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => setIcon(ic)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: icon === ic ? 'rgba(108,92,231,0.1)' : COLORS.background,
                      borderWidth: 2,
                      borderColor: icon === ic ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <Feather
                      name={ic}
                      size={20}
                      color={icon === ic ? COLORS.primary : COLORS.mutedForeground}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </FormCard>

            {/* Skills */}
            <FormCard style={{ marginTop: SPACING.xl }}>
              <Text style={labelStyle}>Развиваемые навыки</Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: SPACING.sm,
                  marginTop: 8,
                }}
              >
                {SKILL_OPTIONS.map((skill) => {
                  const selected = skills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      onPress={() => toggleSkill(skill)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: RADIUS.full,
                        borderWidth: 1,
                        borderColor: selected ? COLORS.primary : COLORS.border,
                        backgroundColor: selected ? COLORS.primary : COLORS.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: selected ? 'white' : COLORS.mutedForeground,
                        }}
                      >
                        {skill.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FormCard>

            {/* Submit */}
            <PrimaryActionButton
              onPress={handleSubmit}
              disabled={loading || !title.trim()}
              style={{
                marginTop: SPACING.xxxl,
              }}
            >
              {loading ? 'СОХРАНЕНИЕ...' : 'СОЗДАТЬ КУРС'}
            </PrimaryActionButton>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const labelStyle = {
  fontSize: 10,
  color: COLORS.mutedForeground,
  fontWeight: TYPOGRAPHY.weight.bold,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: 8,
  marginLeft: 4,
};
