import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { FormCard } from '$components/ui/form/FormCard';
import { LabeledTextInput } from '$components/ui/form/LabeledTextInput';
import { PrimaryActionButton } from '$components/ui/form/PrimaryActionButton';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { COLORS, LAYOUT, SPACING } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { resolveOwnedOrgId } from '$lib/supabaseHelpers';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function GroupCreateScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;

  const [formData, setFormData] = useState({
    name: '',
    maxStudents: '12',
    schedule: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      Alert.alert('Ошибка', 'Supabase не настроен');
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setLoading(false);
      Alert.alert('Ошибка', 'Организация не найдена');
      return;
    }
    const res = await supabase.from('org_groups').insert({
      org_id: orgId,
      name: formData.name,
      course_id: typeof courseId === 'string' ? courseId : null,
      schedule: formData.schedule || null,
      capacity: parseInt(formData.maxStudents, 10) || 0,
      active: true,
    });
    setLoading(false);
    if (res.error) {
      Alert.alert('Ошибка', res.error.message);
      return;
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Создать группу"
        paddingX={paddingX}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
          <FormCard>
            <View style={{ gap: SPACING.xl }}>
              <LabeledTextInput
                label="Название группы *"
                placeholder="Напр: Утренняя группа"
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />

              <LabeledTextInput
                label="Расписание"
                placeholder="Напр: Вт, Чт 16:00"
                value={formData.schedule}
                onChangeText={(val) => setFormData({ ...formData, schedule: val })}
              />

              <LabeledTextInput
                label="Макс. учеников"
                placeholder="12"
                keyboardType="numeric"
                value={formData.maxStudents}
                onChangeText={(val) => setFormData({ ...formData, maxStudents: val })}
              />
            </View>
          </FormCard>

          <PrimaryActionButton onPress={handleSubmit} disabled={loading || !formData.name}>
            {loading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ГРУППУ'}
          </PrimaryActionButton>
        </MotiView>
      </ScrollView>
    </View>
  );
}
