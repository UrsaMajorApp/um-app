// Organization route edit: редактирует существующую запись для сущности курс в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  STATUS_OPTIONS,
  type CourseStatus as Status,
} from '$constants/courseOptions';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useOrgCourseById, useOrgCourses } from '$hooks/useOrgData';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function CourseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;

  const { course, loading: courseLoading } = useOrgCourseById(id);
  const { updateCourse, deleteCourse } = useOrgCourses();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState<Level>('beginner');
  const [status, setStatus] = useState<Status>('draft');
  const [icon, setIcon] = useState('book');
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Populate form once course loads
  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description ?? '');
    setPrice(String(course.price));
    setLevel(course.level);
    setStatus(course.status);
    setIcon(course.icon);
    setSkills(course.skills ?? []);
  }, [course]);

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSave = async () => {
    if (!title.trim() || !id) return;
    setSaving(true);
    const result = await updateCourse(id, {
      title: title.trim(),
      description: description.trim() || undefined,
      level,
      price: parseInt(price, 10) || 0,
      icon,
      skills,
      status,
    });
    setSaving(false);
    if (result.error) {
      Alert.alert('Ошибка', result.error);
      return;
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить курс?',
      `Курс «${title}» будет удалён навсегда. Это действие нельзя отменить.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const result = await deleteCourse(id);
            if (result.error) {
              Alert.alert('Ошибка', result.error);
            } else {
              router.back();
              router.back(); // pop both detail + edit
            }
          },
        },
      ],
    );
  };

  if (courseLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Редактировать курс"
        paddingX={paddingX}
        onBack={() => router.back()}
      />

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
                placeholder="Например: Английский язык"
                value={title}
                onChangeText={setTitle}
              />

              <LabeledTextInput
                label="Описание"
                placeholder="О чём этот курс?"
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
                label="Цена (₸/мес) *"
                placeholder="0"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </FormCard>

            {/* Level + Status */}
            <FormCard style={{ marginTop: SPACING.xl, gap: SPACING.xl }}>
              <View>
                <Text style={labelStyle}>Уровень</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    marginTop: 8,
                  }}
                >
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
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: level === opt.value ? 'white' : COLORS.mutedForeground,
                        }}
                      >
                        {opt.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={labelStyle}>Статус</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    marginTop: 8,
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setStatus(opt.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: RADIUS.lg,
                        alignItems: 'center',
                        backgroundColor:
                          status === opt.value ? `${opt.color}20` : COLORS.background,
                        borderWidth: 1.5,
                        borderColor: status === opt.value ? opt.color : COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: status === opt.value ? opt.color : COLORS.mutedForeground,
                        }}
                      >
                        {opt.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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

            {/* Save */}
            <PrimaryActionButton onPress={handleSave} disabled={saving || !title.trim()}>
              {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
            </PrimaryActionButton>

            {/* Delete */}
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                height: 56,
                borderRadius: RADIUS.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: SPACING.md,
              }}
            >
              <Text
                style={{
                  color: COLORS.destructive,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: 14,
                }}
              >
                УДАЛИТЬ КУРС
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const labelStyle = {
  fontSize: 10,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.mutedForeground,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: 8,
  marginLeft: 4,
};
