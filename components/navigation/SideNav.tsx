import { Feather } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { NotificationsModal } from '$components/navigation/NotificationsModal';
import { useTabNav } from '$components/navigation/useTabNav';
import type { Role } from '$constants/navigation/tabItems';
import type { PressableInteractionState } from '$types/navigation';

interface SideNavProps {
  role: Role | string | null;
}

export function SideNav({ role }: SideNavProps) {
  const router = useRouter();
  const { tabs, go, isActive } = useTabNav(role);
  const { user, logout } = useAuth();

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Profile tab is replaced by the user footer
  const navTabs = tabs.filter((t) => t.key !== 'profile');

  const handleLogout = async () => {
    setDropdownVisible(false);
    await logout();
  };

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() ?? '?';
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Пользователь';

  return (
    <View
      style={{
        width: LAYOUT.sideNavWidth,
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Brand header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <Text
          style={{
            color: COLORS.primary,
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: -0.5,
          }}
        >
          UM
        </Text>
        <Pressable
          onPress={() => setNotificationsVisible(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.muted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="bell" size={18} color={COLORS.mutedForeground} />
        </Pressable>
      </View>

      {/* Nav items */}
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12 }}>
        {navTabs.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.key}
              onPress={() => go(item.route)}
              style={({ hovered, pressed }: PressableInteractionState) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 11,
                marginBottom: 2,
                borderRadius: RADIUS.sm,
                backgroundColor: active
                  ? `${COLORS.primary}12`
                  : pressed
                    ? `${COLORS.primary}10`
                    : hovered
                      ? COLORS.muted
                      : 'transparent',
              })}
            >
              {item.icon({
                color: active ? COLORS.primary : COLORS.mutedForeground,
                size: 19,
              })}
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  fontWeight: active ? '600' : '400',
                  color: active ? COLORS.primary : COLORS.mutedForeground,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* User footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          padding: 12,
        }}
      >
        <Pressable
          onPress={() => setDropdownVisible((v) => !v)}
          style={({ hovered, pressed }: PressableInteractionState) => ({
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderRadius: RADIUS.sm,
            backgroundColor:
              dropdownVisible || pressed
                ? COLORS.muted
                : hovered
                  ? `${COLORS.muted}CC`
                  : 'transparent',
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${COLORS.primary}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15 }}>
              {userInitial}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: '500',
              color: COLORS.foreground,
            }}
            numberOfLines={1}
          >
            {userName}
          </Text>
          <Feather
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.mutedForeground}
          />
        </Pressable>
      </View>

      {dropdownVisible && (
        <>
          <Pressable
            onPress={() => setDropdownVisible(false)}
            style={{
              position: 'absolute',
              top: -9999,
              left: -9999,
              right: -9999,
              bottom: -9999,
              zIndex: 99,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 80,
              left: 12,
              width: LAYOUT.sideNavWidth - 24,
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: 'hidden',
              zIndex: 100,
              ...SHADOWS.md,
            }}
          >
            {[
              {
                label: 'Редактировать профиль',
                icon: 'user' as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push('/profile');
                },
                destructive: false,
              },
              {
                label: 'Способы оплаты',
                icon: 'credit-card' as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push('/parent/subscription' as Href);
                },
                destructive: false,
              },
              {
                label: 'Настройки',
                icon: 'settings' as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push('/profile');
                },
                destructive: false,
              },
              {
                label: 'Выйти',
                icon: 'log-out' as const,
                onPress: handleLogout,
                destructive: true,
              },
            ].map((item, index, arr) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ hovered, pressed }: PressableInteractionState) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.border,
                  backgroundColor: pressed
                    ? COLORS.muted
                    : hovered
                      ? item.destructive
                        ? `${COLORS.destructive}08`
                        : COLORS.muted
                      : 'transparent',
                })}
              >
                <Feather
                  name={item.icon}
                  size={16}
                  color={item.destructive ? COLORS.destructive : COLORS.mutedForeground}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: item.destructive ? COLORS.destructive : COLORS.foreground,
                    fontWeight: item.destructive ? '500' : '400',
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}

// ─── Mobile bottom tab bar ───────────────────────────────────────────────────
