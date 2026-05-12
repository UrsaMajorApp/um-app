// Экран профиля parent: создает профиль для роли родителя.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PARENT_CHILD_AGE_OPTIONS as AGE_OPTIONS,
  PARENT_PROFILE_COLOR as ROLE_COLOR,
  PARENT_PROFILE_GRADIENT as ROLE_GRADIENT,
} from '$constants/profile';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { formatPhone } from '$lib/formatPhone';
import { useIsDesktop } from '$lib/useIsDesktop';
import type { ParentProfileChildDraft } from '$types/profile';

function generateQRPin(): string {
  // Generate a 6-digit PIN (100000-999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function CreateProfileParent() {
  const router = useRouter();
  const { user, finalizeRegistration } = useAuth();
  const { saveParentProfile } = useParentData();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const [parentData, setParentData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) return;

    setParentData((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName,
      lastName: prev.lastName || user.lastName,
      phone: prev.phone || user.phone,
    }));
  }, [user]);

  const [children, setChildren] = useState<ParentProfileChildDraft[]>([
    {
      id: makeId(),
      name: '',
      ageGroup: null,
      hasPhone: null,
      phone: '',
      qrPin: null,
      qrPinExpiresAt: null,
      qrPinOneTimeUse: false,
    },
  ]);

  const canContinue = useMemo(() => {
    const hasParent = parentData.firstName.trim().length > 0;
    const hasValidChild = children.some((c) => {
      if (!c.name.trim() || !c.ageGroup) return false;
      if (c.hasPhone === null) return false;
      if (c.hasPhone && !c.phone.trim()) return false;
      if (!c.hasPhone && !c.qrPin) return false;
      return true;
    });
    return hasParent && hasValidChild;
  }, [parentData, children]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/register');
  }

  function addChild() {
    setChildren((prev) => [
      ...prev,
      {
        id: makeId(),
        name: '',
        ageGroup: null,
        hasPhone: null,
        phone: '',
        qrPin: null,
        qrPinExpiresAt: null,
        qrPinOneTimeUse: false,
      },
    ]);
  }

  function removeChild(id: string) {
    setChildren((prev) => {
      const next = prev.filter((c) => c.id !== id);
      return next.length === 0
        ? [
            {
              id: makeId(),
              name: '',
              ageGroup: null,
              hasPhone: null,
              phone: '',
              qrPin: null,
              qrPinExpiresAt: null,
              qrPinOneTimeUse: false,
            },
          ]
        : next;
    });
  }

  function updateChild(id: string, patch: Partial<ParentProfileChildDraft>) {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  const handleSubmit = async () => {
    await saveParentProfile(
      parentData,
      children.map((c) => ({
        id: c.id,
        name: c.name,
        ageGroup: c.ageGroup,
        phone: c.hasPhone ? c.phone : undefined,
        qrPin: !c.hasPhone ? (c.qrPin ?? undefined) : undefined,
        qrPinExpiresAt: !c.hasPhone ? (c.qrPinExpiresAt ?? undefined) : undefined,
        qrPinOneTimeUse: !c.hasPhone ? c.qrPinOneTimeUse : undefined,
      })),
    );
    await finalizeRegistration();
    router.push('/profile/common/done');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <View style={{ flex: 1 }}>
        {/* Background blobs */}
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: `${ROLE_COLOR}10`,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: '20%',
              left: -80,
              width: 250,
              height: 250,
              borderRadius: 125,
              backgroundColor: `${ROLE_COLOR}05`,
            }}
          />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              paddingVertical: isDesktop ? 24 : 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
                paddingHorizontal: horizontalPadding,
                paddingTop: 8,
              }}
            >
              {/* Header Nav */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <PressableScale
                  onPress={handleBack}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Feather name="arrow-left" size={20} color={COLORS.mutedForeground} />
                  <Text
                    style={{
                      color: COLORS.mutedForeground,
                      marginLeft: 8,
                      fontSize: 15,
                      fontWeight: '500',
                    }}
                  >
                    Назад
                  </Text>
                </PressableScale>

                {/* Step dots: 1 step, last dot is active wide */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: i === 3 ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: i === 3 ? ROLE_COLOR : COLORS.border,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Title Section */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: '900',
                    color: COLORS.foreground,
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }}
                >
                  Профиль родителя
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  Расскажите о себе и добавьте информацию о детях
                </Text>
              </View>

              {/* Personal Info Card */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Feather name="user" size={20} color={ROLE_COLOR} />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: COLORS.foreground,
                      marginLeft: 10,
                    }}
                  >
                    Ваши данные
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Имя</Text>
                    <ProfileTextInput
                      value={parentData.firstName}
                      onChangeText={(text) => setParentData({ ...parentData, firstName: text })}
                      placeholder="Имя"
                      style={styles.input}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.fieldLabel}>Фамилия</Text>
                    <ProfileTextInput
                      value={parentData.lastName}
                      onChangeText={(text) => setParentData({ ...parentData, lastName: text })}
                      placeholder="Фамилия"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.fieldLabel}>Телефон</Text>
                  <ProfileTextInput
                    value={parentData.phone}
                    onChangeText={(text) =>
                      setParentData({ ...parentData, phone: formatPhone(text) })
                    }
                    placeholder="+7 777 777 7777"
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Children Section Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: COLORS.foreground,
                  }}
                >
                  Дети
                </Text>
                <PressableScale
                  onPress={addChild}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: `${ROLE_COLOR}15`,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: RADIUS.xl,
                  }}
                >
                  <Feather name="plus" size={16} color={ROLE_COLOR} />
                  <Text
                    style={{
                      color: ROLE_COLOR,
                      fontWeight: '700',
                      marginLeft: 6,
                    }}
                  >
                    Добавить
                  </Text>
                </PressableScale>
              </View>

              {children.map((child, index) => (
                <View
                  key={child.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: RADIUS.xxl,
                    padding: 24,
                    ...SHADOWS.md,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: ROLE_COLOR,
                        fontWeight: '800',
                        fontSize: 16,
                      }}
                    >
                      Ребенок {index + 1}
                    </Text>
                    {children.length > 1 && (
                      <PressableScale onPress={() => removeChild(child.id)}>
                        <Feather name="trash-2" size={20} color={COLORS.destructive} />
                      </PressableScale>
                    )}
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.fieldLabel}>Имя ребенка</Text>
                    <ProfileTextInput
                      value={child.name}
                      onChangeText={(text) => updateChild(child.id, { name: text })}
                      placeholder="Например, Анна"
                      style={styles.input}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Возрастная категория</Text>
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {AGE_OPTIONS.map((opt) => {
                      const active = child.ageGroup === opt.value;
                      return (
                        <PressableScale
                          key={opt.value}
                          onPress={() => updateChild(child.id, { ageGroup: opt.value })}
                          style={{
                            padding: 14,
                            borderRadius: RADIUS.md,
                            borderWidth: 2,
                            borderColor: active ? ROLE_COLOR : COLORS.border,
                            backgroundColor: active ? `${ROLE_COLOR}08` : COLORS.muted,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: '600',
                              color: active ? ROLE_COLOR : COLORS.mutedForeground,
                            }}
                          >
                            {opt.label}
                          </Text>
                          {active && <Feather name="check-circle" size={20} color={ROLE_COLOR} />}
                        </PressableScale>
                      );
                    })}
                  </View>

                  {/* Phone / QR section */}
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: COLORS.border,
                      paddingTop: 16,
                    }}
                  >
                    <Text style={[styles.fieldLabel, { marginBottom: 12 }]}>
                      Есть ли у ребёнка свой номер телефона?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                      {(['YES', 'NO'] as const).map((opt) => {
                        const active =
                          opt === 'YES' ? child.hasPhone === true : child.hasPhone === false;
                        return (
                          <PressableScale
                            key={opt}
                            onPress={() =>
                              updateChild(child.id, {
                                hasPhone: opt === 'YES',
                                phone: '',
                                qrPin: null,
                              })
                            }
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              borderRadius: RADIUS.md,
                              borderWidth: 2,
                              borderColor: active ? ROLE_COLOR : COLORS.border,
                              backgroundColor: active ? `${ROLE_COLOR}08` : COLORS.muted,
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: '600',
                                color: active ? ROLE_COLOR : COLORS.mutedForeground,
                              }}
                            >
                              {opt === 'YES' ? 'Да' : 'Нет'}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>

                    {child.hasPhone === true && (
                      <View>
                        <Text style={styles.fieldLabel}>Номер телефона ребёнка</Text>
                        <ProfileTextInput
                          value={child.phone}
                          onChangeText={(text) =>
                            updateChild(child.id, { phone: formatPhone(text) })
                          }
                          placeholder="+7 777 777 7777"
                          keyboardType="phone-pad"
                          style={styles.input}
                        />
                      </View>
                    )}

                    {child.hasPhone === false && (
                      <View style={{ alignItems: 'center' }}>
                        {child.qrPin ? (
                          <>
                            <View
                              style={{
                                padding: 20,
                                backgroundColor: COLORS.muted,
                                borderRadius: RADIUS.lg,
                                marginBottom: 12,
                                alignItems: 'center',
                              }}
                            >
                              <QRCode value={child.qrPin} size={140} />
                              <Text
                                style={{
                                  fontSize: 32,
                                  fontWeight: '700',
                                  color: COLORS.foreground,
                                  marginTop: 16,
                                  letterSpacing: 4,
                                }}
                              >
                                {child.qrPin}
                              </Text>
                              {child.qrPinExpiresAt && (
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: COLORS.mutedForeground,
                                    marginTop: 8,
                                  }}
                                >
                                  Действителен{' '}
                                  {Math.round(
                                    (child.qrPinExpiresAt.getTime() - Date.now()) / (1000 * 60),
                                  )}{' '}
                                  мин
                                  {child.qrPinOneTimeUse && ' • Одноразовый'}
                                </Text>
                              )}
                            </View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: COLORS.mutedForeground,
                                textAlign: 'center',
                                marginBottom: 10,
                              }}
                            >
                              Покажите этот код ребёнку для входа в приложение
                            </Text>

                            {/* One-time use toggle */}
                            <PressableScale
                              onPress={() =>
                                updateChild(child.id, {
                                  qrPinOneTimeUse: !child.qrPinOneTimeUse,
                                })
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                backgroundColor: COLORS.background,
                                borderRadius: RADIUS.md,
                                marginBottom: 10,
                              }}
                            >
                              <View
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  borderWidth: 2,
                                  borderColor: child.qrPinOneTimeUse ? ROLE_COLOR : COLORS.border,
                                  backgroundColor: child.qrPinOneTimeUse
                                    ? ROLE_COLOR
                                    : 'transparent',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {child.qrPinOneTimeUse && (
                                  <Feather name="check" size={14} color="white" />
                                )}
                              </View>
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: COLORS.foreground,
                                }}
                              >
                                Одноразовый код
                              </Text>
                            </PressableScale>

                            <PressableScale
                              onPress={() => {
                                const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
                                updateChild(child.id, {
                                  qrPin: generateQRPin(),
                                  qrPinExpiresAt: expiresAt,
                                });
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <Feather name="refresh-cw" size={14} color={ROLE_COLOR} />
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: ROLE_COLOR,
                                  fontWeight: '600',
                                }}
                              >
                                Обновить код
                              </Text>
                            </PressableScale>
                          </>
                        ) : (
                          <PressableScale
                            onPress={() => {
                              const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
                              updateChild(child.id, {
                                qrPin: generateQRPin(),
                                qrPinExpiresAt: expiresAt,
                              });
                            }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              paddingVertical: 14,
                              paddingHorizontal: 20,
                              borderRadius: RADIUS.md,
                              borderWidth: 2,
                              borderColor: ROLE_COLOR,
                              borderStyle: 'dashed',
                              width: '100%',
                            }}
                          >
                            <Feather name="grid" size={18} color={ROLE_COLOR} />
                            <Text
                              style={{
                                color: ROLE_COLOR,
                                fontWeight: '700',
                                fontSize: 14,
                              }}
                            >
                              Создать код для входа
                            </Text>
                          </PressableScale>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Submit Button */}
              <PressableScale
                onPress={handleSubmit}
                disabled={!canContinue}
                style={{ marginTop: 8, marginBottom: 40 }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={canContinue ? ROLE_GRADIENT : [COLORS.muted, COLORS.muted]}
                  style={{
                    paddingVertical: 18,
                    borderRadius: RADIUS.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...SHADOWS.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: canContinue ? 'white' : COLORS.mutedForeground,
                    }}
                  >
                    Продолжить
                  </Text>
                </LinearGradient>
              </PressableScale>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProfileTextInput({
  value,
  placeholder,
  style,
  ...props
}: React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      <TextInput {...props} value={value} placeholder="" style={style} />
      {!value && !!placeholder && (
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: 22,
            right: 16,
            pointerEvents: 'none',
            color: COLORS.mutedForeground,
            fontSize: 15,
            fontWeight: '500',
          }}
        >
          {placeholder}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  input: {
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.foreground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
