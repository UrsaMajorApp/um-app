import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '$components/admin/AdminHeader';
import { SegmentTabs } from '$components/admin/SegmentTabs';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAdminOnboardingQuestions, useAIRules, useTags } from '$hooks/useAdminData';
import { useAdminLayout } from '$lib/adminUtils';
import type { AdminSettingsTab } from '$types/admin';

export default function AdminSettingsScreen() {
  const { paddingX } = useAdminLayout();
  const onboarding = useAdminOnboardingQuestions();
  const tags = useTags();
  const aiRules = useAIRules();
  const [tab, setTab] = useState<AdminSettingsTab>('onboarding');
  const [newTagName, setNewTagName] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState({
    name: '',
    condition: '',
    recommendation_title: '',
    recommendation_body: '',
  });
  const audienceLabels: Record<string, string> = {
    parent: 'Родитель (онбординг)',
    org: 'Организация (онбординг)',
    child: 'Ребенок (диагностика)',
    youth: 'Молодежь (диагностика)',
    parent_diagnostic: 'Родитель (диагностика ребенка)',
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Настройки платформы" subtitle="Онбординг, теги и правила рекомендаций" />
      <SegmentTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: 'onboarding', label: 'Вопросы онбординга' },
          { key: 'tags', label: 'Справочник тегов' },
          { key: 'logic', label: 'AI логика' },
        ]}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tab === 'onboarding' ? (
          <View style={{ paddingHorizontal: paddingX, paddingBottom: SPACING.xl }}>
            {onboarding.loading ? (
              <Text style={{ color: COLORS.mutedForeground }}>Загрузка...</Text>
            ) : null}
            {(['parent', 'org', 'child', 'youth', 'parent_diagnostic'] as const).map((audience) => {
              const rows = onboarding.data.filter((q) => q.audience === audience);
              if (rows.length === 0) return null;
              return (
                <View key={audience} style={{ marginBottom: SPACING.xl }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.sm,
                      fontWeight: '700',
                      color: COLORS.mutedForeground,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      marginBottom: SPACING.sm,
                    }}
                  >
                    {audienceLabels[audience]}
                  </Text>
                  {rows.map((question) => (
                    <View
                      key={question.id}
                      style={{
                        padding: SPACING.lg,
                        borderRadius: RADIUS.lg,
                        backgroundColor: COLORS.surface,
                        marginBottom: SPACING.sm,
                        borderWidth: 1,
                        borderColor: question.active ? COLORS.border : `${COLORS.border}60`,
                        opacity: question.active ? 1 : 0.55,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: SPACING.sm,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.md,
                            fontWeight: '500',
                            color: COLORS.foreground,
                            marginBottom: 4,
                          }}
                        >
                          {question.display_order}. {question.question_text}
                        </Text>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.xs,
                            color: COLORS.mutedForeground,
                          }}
                        >
                          {question.answers.join(' · ')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onboarding.toggleActive(question.id, !question.active)}
                        style={{ padding: 4 }}
                      >
                        <Feather
                          name={question.active ? 'eye' : 'eye-off'}
                          size={16}
                          color={COLORS.mutedForeground}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Удалить вопрос?', question.question_text, [
                            { text: 'Отмена', style: 'cancel' },
                            {
                              text: 'Удалить',
                              style: 'destructive',
                              onPress: () => onboarding.remove(question.id),
                            },
                          ])
                        }
                        style={{ padding: 4 }}
                      >
                        <Feather name="trash-2" size={16} color={COLORS.destructive} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}
        {tab === 'tags' ? (
          <View style={{ padding: paddingX }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: SPACING.md,
                marginBottom: SPACING.lg,
              }}
            >
              {tags.data.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  onLongPress={() => tags.remove(tag.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: RADIUS.full,
                    backgroundColor: `${COLORS.primary}15`,
                    borderWidth: 1,
                    borderColor: `${COLORS.primary}30`,
                  }}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: SPACING.sm,
                alignItems: 'center',
              }}
            >
              <TextInput
                value={newTagName}
                onChangeText={setNewTagName}
                placeholder="новый тег"
                style={{
                  flex: 1,
                  padding: SPACING.md,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.surface,
                  color: COLORS.foreground,
                }}
              />
              <TouchableOpacity
                onPress={async () => {
                  await tags.add(newTagName);
                  setNewTagName('');
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.primary,
                }}
              >
                <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Добавить</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xs,
                color: COLORS.mutedForeground,
                marginTop: SPACING.sm,
              }}
            >
              Долгое нажатие на тег удаляет его.
            </Text>
          </View>
        ) : null}
        {tab === 'logic' ? (
          <View style={{ paddingHorizontal: paddingX, paddingBottom: SPACING.xl }}>
            {aiRules.data.map((rule) => {
              const isEditing = editingRuleId === rule.id;
              return (
                <View
                  key={rule.id}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: RADIUS.lg,
                    borderWidth: 1,
                    borderColor: isEditing ? `${COLORS.primary}60` : COLORS.border,
                    marginBottom: SPACING.md,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.lg,
                      gap: SPACING.md,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => aiRules.toggle(rule.id, !rule.enabled)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: rule.enabled ? COLORS.success : COLORS.muted,
                        justifyContent: 'center',
                        paddingHorizontal: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: COLORS.white,
                          alignSelf: rule.enabled ? 'flex-end' : 'flex-start',
                          ...SHADOWS.sm,
                        }}
                      />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: TYPOGRAPHY.size.md,
                          color: rule.enabled ? COLORS.foreground : COLORS.mutedForeground,
                        }}
                      >
                        {rule.name}
                      </Text>
                      {!isEditing ? (
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.xs,
                            color: COLORS.mutedForeground,
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {rule.condition} {'->'} {rule.recommendation_title}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (isEditing) setEditingRuleId(null);
                        else {
                          setEditingRuleId(rule.id);
                          setEditingRule({
                            name: rule.name,
                            condition: rule.condition,
                            recommendation_title: rule.recommendation_title,
                            recommendation_body: rule.recommendation_body ?? '',
                          });
                        }
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: RADIUS.md,
                        backgroundColor: isEditing ? `${COLORS.primary}15` : COLORS.muted,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather
                        name={isEditing ? 'x' : 'edit-2'}
                        size={14}
                        color={isEditing ? COLORS.primary : COLORS.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                  {isEditing ? (
                    <View
                      style={{
                        paddingHorizontal: SPACING.lg,
                        paddingBottom: SPACING.lg,
                        gap: SPACING.sm,
                      }}
                    >
                      {(
                        [
                          'name',
                          'condition',
                          'recommendation_title',
                          'recommendation_body',
                        ] as const
                      ).map((field) => (
                        <TextInput
                          key={field}
                          value={editingRule[field]}
                          onChangeText={(v) => setEditingRule((prev) => ({ ...prev, [field]: v }))}
                          placeholder={field}
                          multiline={field === 'recommendation_body'}
                          style={{
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: RADIUS.md,
                            padding: SPACING.md,
                            fontSize: TYPOGRAPHY.size.sm,
                            color: COLORS.foreground,
                            backgroundColor: COLORS.background,
                            minHeight: field === 'recommendation_body' ? 60 : undefined,
                          }}
                        />
                      ))}
                      <TouchableOpacity
                        onPress={async () => {
                          await aiRules.updateRule(rule.id, editingRule);
                          setEditingRuleId(null);
                        }}
                        style={{
                          backgroundColor: COLORS.primary,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.md,
                          alignItems: 'center',
                          marginTop: SPACING.sm,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontWeight: 'bold',
                            fontSize: TYPOGRAPHY.size.sm,
                          }}
                        >
                          Сохранить
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
