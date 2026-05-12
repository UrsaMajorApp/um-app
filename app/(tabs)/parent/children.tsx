// Экран parent/children: загружает и показывает детей родителя в кабинете родителя.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditChildModal from '$components/parent/EditChildModal';
import { COLORS, SHADOWS } from '$constants/theme';
import { useParentData } from '$contexts/ParentDataContext';
import { navigateApp } from '$lib/appNavigation';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { Child } from '$types/child';

export default function ParentChildren() {
  const router = useRouter();
  const { childrenProfile: children, removeChild, updateChild } = useParentData();
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const confirmRemove = (child: Child) => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Удалить профиль "${child.name}"? Это действие нельзя отменить.`)) {
        removeChild(child.id);
      }
    } else {
      Alert.alert(
        'Удалить ребёнка?',
        `Профиль "${child.name}" будет удалён. Это действие нельзя отменить.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: () => removeChild(child.id),
          },
        ],
      );
    }
  };

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
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: horizontalPadding,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Feather name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>Мои дети</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 100,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/profile/youth/create-profile-child')}
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 24,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.border,
            ...SHADOWS.sm,
          }}
        >
          <Feather name="plus" size={24} color="#6C5CE7" />
          <Text
            style={{
              color: '#6C5CE7',
              fontWeight: '700',
              fontSize: 16,
              marginLeft: 10,
            }}
          >
            Добавить ребенка
          </Text>
        </TouchableOpacity>

        {children.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              padding: 30,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '500' }}>
              Дети пока не добавлены
            </Text>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 13,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Нажмите кнопку выше, чтобы создать профиль для вашего ребенка
            </Text>
          </View>
        ) : (
          children.map((child, index) => (
            <View
              key={child.id || index}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 24,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                ...SHADOWS.sm,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigateApp(router, 'parent', { name: 'parentChildDetails', childId: child.id })
                }
                style={{
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#6C5CE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>
                    {(child.name || '').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#1F2937',
                    }}
                  >
                    {child.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                    {child.ageCategory === 'child'
                      ? 'Ребенок (6-11 лет)'
                      : child.ageCategory === 'teen'
                        ? 'Подросток (12-17 лет)'
                        : 'Студент (18-20 лет)'}
                    {child.age ? ` • ${child.age} лет` : ''}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#6C5CE7',
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#6C5CE7',
                        fontWeight: '600',
                      }}
                    >
                      Активен
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#C4B5FD" />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(108,92,231,0.1)',
                }}
              >
                <TouchableOpacity
                  onPress={() => setEditingChild(child)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    gap: 6,
                  }}
                >
                  <Feather name="edit-2" size={15} color="#6C5CE7" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#6C5CE7',
                      fontWeight: '600',
                    }}
                  >
                    Изменить
                  </Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: 'rgba(108,92,231,0.1)' }} />
                <TouchableOpacity
                  onPress={() => confirmRemove(child)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    gap: 6,
                  }}
                >
                  <Feather name="trash-2" size={15} color={COLORS.destructive} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.destructive,
                      fontWeight: '600',
                    }}
                  >
                    Удалить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {editingChild && (
        <EditChildModal
          child={editingChild}
          onSave={(patch) => updateChild(editingChild.id, patch)}
          onClose={() => setEditingChild(null)}
        />
      )}
    </View>
  );
}
