// Экран входа: принимает телефон/email и пароль, запускает Google OAuth или QR-вход.
import { AntDesign, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthMethodSwitcher } from '$components/auth/AuthMethodSwitcher';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { formatPhone } from '$lib/formatPhone';
import { useIsDesktop } from '$lib/useIsDesktop';
import { blurActiveWebElement } from '$lib/webFocus';
import type { AuthMethod } from '$types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithIdentifier, loginWithGoogle } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const isEmail = authMethod === 'email';
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const isValidPhone = identifier.replace(/\D/g, '').length >= 10;
  const canSubmit = (isEmail ? isValidEmail : isValidPhone) && password.length >= 6;

  const handleIdentifierChange = (text: string) => {
    if (isEmail) {
      setIdentifier(text.trim());
      return;
    }
    setIdentifier(formatPhone(text));
  };

  const handleAuthMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setIdentifier('');
    setError('');
  };

  const navigateToForgotPassword = () => {
    blurActiveWebElement();
    router.push('/forgot-password');
  };

  const navigateToRegister = () => {
    blurActiveWebElement();
    router.push('/register');
  };

  const navigateToQrScan = () => {
    blurActiveWebElement();
    router.push('/(auth)/qr-scan');
  };

  const handleGoogleLogin = async () => {
    blurActiveWebElement();
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Не удалось войти через Google');
        return;
      }
      // On web the browser navigates to Google before this runs — don't push a
      // route with no authenticated user or the root guard bounces to /intro.
      if (Platform.OS !== 'web') {
        blurActiveWebElement();
        router.replace('/(tabs)/home');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Не удалось войти через Google');
    } finally {
      setIsGoogleLoading(false);
    }
    // On success (native) the onAuthStateChange listener in AuthContext
    // will hydrate the user; the app's root _layout will redirect to /home.
  };

  const handleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    const result = await loginWithIdentifier(identifier, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Не удалось войти');
      return;
    }
    blurActiveWebElement();
    router.replace('/(tabs)/home');
  };

  const handleBack = () => {
    blurActiveWebElement();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/intro');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Background Blobs */}
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute',
              top: -60,
              left: -60,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: `${COLORS.primary}10`,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: '15%',
              right: -80,
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: `${COLORS.secondary}05`,
            }}
          />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              paddingTop: isDesktop ? 24 : 12,
              paddingBottom: 20,
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
              {/* Back Button */}
              <PressableScale
                onPress={handleBack}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginBottom: 32,
                }}
                scaleTo={0.93}
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

              {/* Header */}
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 500 }}
                style={{ marginBottom: 32 }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: '900',
                    color: COLORS.foreground,
                    marginBottom: 8,
                    letterSpacing: -1,
                  }}
                >
                  С возвращением!
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  Введите данные ниже, чтобы продолжить обучение и достигать новых высот
                </Text>
              </MotiView>

              {/* Form Card */}
              <MotiView
                from={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 100 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                }}
              >
                <AuthMethodSwitcher value={authMethod} onChange={handleAuthMethodChange} />

                {/* Login Field */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>{isEmail ? 'EMAIL' : 'НОМЕР ТЕЛЕФОНА'}</Text>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name={isEmail ? 'mail' : 'phone'}
                      size={18}
                      color={COLORS.mutedForeground}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={isEmail ? 'you@example.com' : '+7 777 777 7777'}
                      placeholderTextColor={COLORS.mutedForeground}
                      value={identifier}
                      onChangeText={handleIdentifierChange}
                      keyboardType={isEmail ? 'email-address' : 'phone-pad'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100"
                      style={styles.inputText}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>ПАРОЛЬ</Text>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name="lock"
                      size={18}
                      color={COLORS.mutedForeground}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Ваш пароль"
                      placeholderTextColor={COLORS.mutedForeground}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-100"
                      style={styles.inputText}
                    />
                    <PressableScale
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      scaleTo={0.85}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={COLORS.mutedForeground}
                      />
                    </PressableScale>
                  </View>
                </View>

                <PressableScale
                  onPress={navigateToForgotPassword}
                  style={{ alignSelf: 'flex-end', marginBottom: 24 }}
                  scaleTo={0.93}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    Забыли пароль?
                  </Text>
                </PressableScale>

                {!!error && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.errorBox}
                  >
                    <Text style={styles.errorText}>{error}</Text>
                  </MotiView>
                )}

                {/* Submit button inside card for cohesion */}
                <PressableScale onPress={handleLogin} disabled={isSubmitting || !canSubmit}>
                  <LinearGradient
                    colors={
                      canSubmit ? [COLORS.primary, COLORS.secondary] : [COLORS.muted, COLORS.muted]
                    }
                    style={styles.submitBtn}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '800',
                          color: canSubmit ? 'white' : COLORS.mutedForeground,
                        }}
                      >
                        Войти
                      </Text>
                    )}
                  </LinearGradient>
                </PressableScale>
              </MotiView>

              <View style={styles.accountSwitchRow}>
                <Text style={styles.accountSwitchText}>Нет аккаунта? </Text>
                <PressableScale onPress={navigateToRegister} scaleTo={0.93}>
                  <Text style={styles.accountSwitchLink}>Зарегистрироваться</Text>
                </PressableScale>
              </View>

              {/* Social / alternative login */}
              <View style={{ marginTop: 20 }}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>или</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialChipRow}>
                  {/* Google */}
                  <PressableScale
                    onPress={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    style={styles.socialChip}
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator size="small" color={COLORS.mutedForeground} />
                    ) : (
                      <AntDesign name="google" size={20} color="#4285F4" />
                    )}
                    <Text style={styles.socialChipText}>Google</Text>
                  </PressableScale>

                  {/* QR */}
                  <PressableScale
                    onPress={navigateToQrScan}
                    style={styles.socialChip}
                  >
                    <Feather name="grid" size={20} color={COLORS.primary} />
                    <Text style={styles.socialChipText}>QR-код</Text>
                  </PressableScale>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputText: {
    fontSize: 15,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  socialChipRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  socialChip: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  socialChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  accountSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    marginTop: 18,
  },
  accountSwitchText: {
    color: COLORS.mutedForeground,
    fontSize: 15,
  },
  accountSwitchLink: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
});
