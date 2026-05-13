// DevRoleSwitcher: быстро переключает demo-роли без ручного логина и перезапуска приложения.
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { DEV_DATA_KEY, DEV_TOOLS_KEY } from '$constants/dev';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';
import { type UserRole, useAuth } from '$contexts/AuthContext';
import { useDevSettings } from '$contexts/DevSettingsContext';
import { useParentData } from '$contexts/ParentDataContext';
import { emitDevDataChanged } from '$lib/devDataEvents';
import { clearAllDevData, clearDevData, getDevDataSeeded, seedDevData } from '$lib/devSeedData';
import { isWebMinWidth } from '$lib/useIsDesktop';

export function DevRoleSwitcher() {
  const [visible, setVisible] = useState(false);
  const [devToolsEnabled, setDevToolsEnabledState] = useState(false);
  const [devDataEnabled, setDevDataEnabled] = useState(false);
  const [syncingDevData, setSyncingDevData] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const [clearingRole, setClearingRole] = useState(false);

  // All hooks up-front so they're in scope for toggleDevTools
  const { user, devLogin, logout, devMode, setDevMode, devOtpCode } = useAuth();
  const { parentProfile, setParentTariff } = useParentData();
  const {
    mentorApproved,
    setMentorApproved,
    orgVerified,
    setOrgVerified,
    useRealOtp,
    setUseRealOtp,
  } = useDevSettings();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isDesktop = isWebMinWidth(width, 768);
  const isDevSessionUser = Boolean(
    user &&
      (user.email.endsWith('@dev.local') ||
        (user.email.endsWith('@example.com') && user.phone === '79991234567')),
  );
  const canManageDevData = devToolsEnabled && Boolean(user) && !syncingDevData;

  if (!__DEV__) return null;

  const notifyDevDataError = (message: string) => {
    Alert.alert('Dev data sync failed', message);
  };

  // Persist master dev-tools flag; sync dependent settings automatically
  const toggleDevTools = async (value: boolean) => {
    setDevToolsEnabledState(value);
    await AsyncStorage.setItem(DEV_TOOLS_KEY, value ? 'true' : 'false');
    await setDevMode(value);
    if (value) {
      // Enabling → switch to fake OTP
      if (useRealOtp) await setUseRealOtp(false);
    } else {
      // Disabling → restore real OTP and close any active dev-switcher session.
      if (!useRealOtp) await setUseRealOtp(true);
      setDevDataEnabled(false);
      await AsyncStorage.setItem(DEV_DATA_KEY, 'false');
      if (isDevSessionUser) {
        await logout();
        router.replace('/intro');
      }
      setVisible(false);
    }
  };

  const toggleDevData = async (value: boolean) => {
    if (!canManageDevData) return;

    setSyncingDevData(true);
    try {
      if (value) {
        await seedDevData();
      } else {
        await clearDevData();
      }

      setDevDataEnabled(value);
      await AsyncStorage.setItem(DEV_DATA_KEY, value ? 'true' : 'false');
      emitDevDataChanged();
    } catch (error) {
      notifyDevDataError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingDevData(false);
    }
  };

  const runClearAllPopulatedDevData = async () => {
    setSyncingDevData(true);
    try {
      await clearAllDevData();
      setDevDataEnabled(false);
      await AsyncStorage.setItem(DEV_DATA_KEY, 'false');
      emitDevDataChanged();
    } catch (error) {
      notifyDevDataError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingDevData(false);
    }
  };

  const clearAllPopulatedDevData = async () => {
    if (!canManageDevData) return;

    const title = 'Clear all populated data?';
    const message =
      'This restores every active dev snapshot and removes populated records for everyone.';

    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n\n${message}`)) {
        await runClearAllPopulatedDevData();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: runClearAllPopulatedDevData,
      },
    ]);
  };

  // Restore persisted master state when modal opens
  const handleOpen = async () => {
    const stored = await AsyncStorage.getItem(DEV_TOOLS_KEY);
    const nextDevToolsEnabled = stored !== null ? stored === 'true' : devMode;
    setDevToolsEnabledState(nextDevToolsEnabled);

    const storedDevData = await AsyncStorage.getItem(DEV_DATA_KEY);
    if (storedDevData !== null) setDevDataEnabled(storedDevData === 'true');

    if (!nextDevToolsEnabled) {
      setDevDataEnabled(false);
      setVisible(true);
      return;
    }

    if (user) {
      try {
        const remoteSeeded = await getDevDataSeeded();
        setDevDataEnabled(remoteSeeded);
        await AsyncStorage.setItem(DEV_DATA_KEY, remoteSeeded ? 'true' : 'false');
      } catch {
        // Keep the local switch state when Supabase is unavailable or the
        // migration has not been pushed yet.
      }
    }

    setVisible(true);
  };

  const roles: UserRole[] = [
    'parent',
    'child',
    'youth',
    'young-adult',
    'mentor',
    'org',
    'teacher',
    'admin',
  ];

  const handleSwitch = async (role: UserRole) => {
    if (!devToolsEnabled || switchingRole || clearingRole) return;

    setSwitchingRole(role);
    try {
      await devLogin(role);
      setVisible(false);
      router.replace('/(tabs)/home');
    } finally {
      setSwitchingRole(null);
    }
  };

  const handleClearRole = async () => {
    if (!devToolsEnabled || switchingRole || clearingRole || !user || !isDevSessionUser) return;

    setClearingRole(true);
    try {
      await logout();
      setVisible(false);
    } finally {
      setClearingRole(false);
    }
  };

  return (
    <>
      <PressableScale onPress={handleOpen} style={styles.floatingButton} activeOpacity={0.8}>
        <Feather name="settings" size={20} color="white" />
        <Text style={styles.buttonText}>DEV</Text>
      </PressableScale>

      <Modal
        visible={visible}
        transparent
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={() => setVisible(false)}
      >
        {/* Backdrop — stops propagation so inner presses don't bubble up */}
        <Pressable
          style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}
          onPress={() => setVisible(false)}
        >
          {/* Inner card — swallows taps so backdrop doesn't fire */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Developer Tools</Text>
              <PressableScale onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color={COLORS.mutedForeground} />
              </PressableScale>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── Master toggle ── */}
              <View style={styles.devModeRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.devModeTitle}>Dev Mode</Text>
                  <Text style={styles.devModeSubtitle}>Enable developer options below</Text>
                </View>
                <Switch
                  value={devToolsEnabled}
                  onValueChange={toggleDevTools}
                  trackColor={{ false: COLORS.muted, true: COLORS.primary }}
                />
              </View>

              {devToolsEnabled && (
                <>
                  <View style={styles.devModeRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.devModeTitle}>Populated Dev Data</Text>
                      <Text style={styles.devModeSubtitle}>
                        {user
                          ? 'Seed or restore deterministic Supabase demo records'
                          : 'Sign in with any account to seed Supabase demo records'}
                      </Text>
                    </View>
                    {syncingDevData ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Switch
                        value={devDataEnabled}
                        onValueChange={toggleDevData}
                        trackColor={{ false: COLORS.muted, true: COLORS.success }}
                        disabled={!canManageDevData}
                      />
                    )}
                  </View>

                  <PressableScale
                    style={[
                      styles.clearAllDevDataButton,
                      (!canManageDevData || syncingDevData) && styles.disabledRoleButton,
                    ]}
                    onPress={clearAllPopulatedDevData}
                    disabled={!canManageDevData || syncingDevData}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name="trash-2"
                      size={14}
                      color={COLORS.destructive}
                      style={styles.roleButtonSpinner}
                    />
                    <Text style={styles.clearAllDevDataText}>Clear all populated data</Text>
                  </PressableScale>

                  {/* OTP mode toggle */}
                  <View style={styles.devModeRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.devModeTitle}>
                        OTP: {useRealOtp ? 'Real SMS ✉️' : `Fake (${devOtpCode ?? '1234'})`}
                      </Text>
                      <Text style={styles.devModeSubtitle}>
                        {useRealOtp
                          ? 'Supabase sends a real SMS code'
                          : 'Any login accepts the dev code above'}
                      </Text>
                    </View>
                    <Switch
                      value={useRealOtp}
                      onValueChange={(val) => {
                        if (devToolsEnabled) setUseRealOtp(val);
                      }}
                      trackColor={{ false: COLORS.muted, true: '#F59E0B' }}
                    />
                  </View>

                  {/* Tariff toggle (parent/student roles) */}
                  {['parent', 'child', 'youth', 'young-adult'].includes(user?.role || '') && (
                    <View style={styles.devModeRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.devModeTitle}>
                          Tariff: {parentProfile?.tariff?.toUpperCase() || 'BASIC'}
                        </Text>
                        <Text style={styles.devModeSubtitle}>Toggle PRO features</Text>
                      </View>
                      <Switch
                        value={parentProfile?.tariff === 'pro'}
                        onValueChange={(val) => {
                          if (devToolsEnabled) setParentTariff(val ? 'pro' : 'basic');
                        }}
                        trackColor={{ false: COLORS.muted, true: '#A78BFA' }}
                      />
                    </View>
                  )}

                  {/* Mentor approval toggle */}
                  {user?.role === 'mentor' && (
                    <View style={styles.devModeRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.devModeTitle}>
                          Mentor: {mentorApproved ? 'Approved ✓' : 'Pending…'}
                        </Text>
                        <Text style={styles.devModeSubtitle}>Simulate admin approval state</Text>
                      </View>
                      <Switch
                        value={mentorApproved}
                        onValueChange={(val) => {
                          if (devToolsEnabled) setMentorApproved(val);
                        }}
                        trackColor={{ false: COLORS.muted, true: COLORS.success }}
                      />
                    </View>
                  )}

                  {/* Org verification toggle */}
                  {user?.role === 'org' && (
                    <View style={styles.devModeRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.devModeTitle}>
                          Org: {orgVerified ? 'Verified ✓' : 'Pending…'}
                        </Text>
                        <Text style={styles.devModeSubtitle}>
                          Simulate admin verification state
                        </Text>
                      </View>
                      <Switch
                        value={orgVerified}
                        onValueChange={(val) => {
                          if (devToolsEnabled) setOrgVerified(val);
                        }}
                        trackColor={{ false: COLORS.muted, true: COLORS.success }}
                      />
                    </View>
                  )}

                  {/* Current user info */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoValue}>{user?.role || 'none'}</Text>
                  </View>
                  <View style={[styles.infoRow, { marginBottom: 16 }]}>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={[styles.infoValue, { fontSize: 11 }]} numberOfLines={1}>
                      {user?.id || '—'}
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>Switch role</Text>
                  <View style={styles.grid}>
                    {roles.map((role) => {
                      const isActive = user?.role === role;
                      const isSwitching = switchingRole === role;

                      return (
                        <PressableScale
                          key={role}
                          style={[
                            styles.roleButton,
                            isActive && styles.activeRoleButton,
                            (!devToolsEnabled || clearingRole || (switchingRole && !isSwitching)) &&
                              styles.disabledRoleButton,
                          ]}
                          onPress={() => handleSwitch(role)}
                          disabled={!devToolsEnabled || Boolean(switchingRole) || clearingRole}
                          activeOpacity={0.75}
                        >
                          {isSwitching && (
                            <ActivityIndicator
                              size="small"
                              color={isActive ? 'white' : COLORS.primary}
                              style={styles.roleButtonSpinner}
                            />
                          )}
                          <Text
                            style={[styles.roleButtonText, isActive && styles.activeRoleButtonText]}
                          >
                            {role}
                          </Text>
                        </PressableScale>
                      );
                    })}
                    <PressableScale
                      style={[
                        styles.roleButton,
                        styles.clearRoleButton,
                        (!user ||
                          !isDevSessionUser ||
                          !devToolsEnabled ||
                          switchingRole ||
                          clearingRole) &&
                          styles.disabledRoleButton,
                      ]}
                      onPress={handleClearRole}
                      disabled={
                        !user ||
                        !isDevSessionUser ||
                        !devToolsEnabled ||
                        Boolean(switchingRole) ||
                        clearingRole
                      }
                      activeOpacity={0.75}
                    >
                      {clearingRole ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.destructive}
                          style={styles.roleButtonSpinner}
                        />
                      ) : (
                        <Feather
                          name="user-x"
                          size={14}
                          color={COLORS.destructive}
                          style={styles.roleButtonSpinner}
                        />
                      )}
                      <Text style={[styles.roleButtonText, styles.clearRoleButtonText]}>
                        clear role
                      </Text>
                    </PressableScale>
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...SHADOWS.lg,
    flexDirection: 'column',
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  // Mobile: slide-up sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Desktop: centered dialog
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: 24,
    maxHeight: '85%',
  },
  modalContentDesktop: {
    borderRadius: RADIUS.lg,
    width: 420,
    maxHeight: '80%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionMuted: {
    opacity: 0.35,
  },
  devModeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  devModeSubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.mutedForeground,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.foreground,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  ageButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  roleButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.muted,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoleButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  clearRoleButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.destructive,
  },
  clearAllDevDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: -4,
    marginBottom: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.destructive,
    backgroundColor: COLORS.background,
  },
  clearAllDevDataText: {
    color: COLORS.destructive,
    fontWeight: '600',
    fontSize: 13,
  },
  disabledRoleButton: {
    opacity: 0.5,
  },
  roleButtonSpinner: {
    marginRight: 6,
  },
  roleButtonText: {
    color: COLORS.foreground,
    fontWeight: '500',
    fontSize: 13,
  },
  activeRoleButtonText: {
    color: 'white',
  },
  clearRoleButtonText: {
    color: COLORS.destructive,
  },
});
