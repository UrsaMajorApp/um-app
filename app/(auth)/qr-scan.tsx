import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, LAYOUT, RADIUS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useIsDesktop } from '$lib/useIsDesktop';

const CORNER_GUIDES = [
  {
    id: 'top-left',
    top: 20,
    left: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  {
    id: 'top-right',
    top: 20,
    right: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  {
    id: 'bottom-left',
    bottom: 20,
    left: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  {
    id: 'bottom-right',
    bottom: 20,
    right: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
] as const;

export default function QRScanScreen() {
  const router = useRouter();
  const { loginWithQR } = useAuth();

  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On web or when user prefers manual entry
  const [useManual, setUseManual] = useState(false);

  // Web camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webCameraActive, setWebCameraActive] = useState(false);
  const [webCameraError, setWebCameraError] = useState('');

  const processCode = useCallback(
    async (raw: string) => {
      setIsSubmitting(true);
      const token = raw.trim();

      if (!token) {
        setError('Неверный QR-код');
        setScanned(false);
        setIsSubmitting(false);
        return;
      }

      const result = await loginWithQR(token);
      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        setError(result.error ?? 'Недействительный QR-код');
        setScanned(false);
      }
      setIsSubmitting(false);
    },
    [loginWithQR, router],
  );

  const handleQRData = useCallback(
    async (data: string) => {
      if (scanned || isSubmitting) return;
      setScanned(true);
      setError('');
      await processCode(data);
    },
    [isSubmitting, processCode, scanned],
  );

  // Web camera QR scanning
  useEffect(() => {
    if (Platform.OS !== 'web' || useManual || !webCameraActive) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startWebCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          scanQRCode();
        }
      } catch {
        setWebCameraError('Не удалось получить доступ к камере');
        setWebCameraActive(false);
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(scanQRCode);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamically import jsQR for web only
      import('jsqr').then(({ default: jsQR }) => {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && !scanned) {
          handleQRData(code.data);
        }
      });

      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    startWebCamera();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [webCameraActive, useManual, scanned, handleQRData]);

  const startWebScanning = () => {
    setWebCameraActive(true);
    setWebCameraError('');
    setError('');
    setScanned(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
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
              {/* Back button */}
              <PressableScale
                onPress={() => router.back()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
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
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 500 }}
                style={{ marginBottom: 28 }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: '700',
                    color: COLORS.foreground,
                    marginBottom: 6,
                  }}
                >
                  Войти по QR-коду
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Попроси родителя показать QR-код из своего приложения
                </Text>
              </MotiView>

              {/* Camera / manual toggle */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: COLORS.muted,
                  borderRadius: RADIUS.md,
                  padding: 4,
                  marginBottom: 20,
                }}
              >
                {(['camera', 'manual'] as const).map((mode) => {
                  const active = mode === 'camera' ? !useManual : useManual;
                  return (
                    <PressableScale
                      key={mode}
                      onPress={() => {
                        setUseManual(mode === 'manual');
                        setError('');
                        setScanned(false);
                        setWebCameraActive(false);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: RADIUS.md - 2,
                        alignItems: 'center',
                        backgroundColor: active ? COLORS.card : 'transparent',
                      }}
                      scaleTo={0.94}
                    >
                      <Text
                        style={{
                          fontWeight: '600',
                          fontSize: 13,
                          color: active ? COLORS.foreground : COLORS.mutedForeground,
                        }}
                      >
                        {mode === 'camera' ? 'Сканировать' : 'Ввести код'}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              {/* Web Camera view */}
              {!useManual && Platform.OS === 'web' && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 400 }}
                >
                  {!webCameraActive ? (
                    <View
                      style={{
                        alignItems: 'center',
                        paddingVertical: 40,
                        backgroundColor: COLORS.muted,
                        borderRadius: RADIUS.lg,
                        marginBottom: 16,
                      }}
                    >
                      <Feather name="camera" size={40} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          color: COLORS.foreground,
                          fontWeight: '600',
                          fontSize: 15,
                          marginTop: 12,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        Сканировать QR-код
                      </Text>
                      <Text
                        style={{
                          color: COLORS.mutedForeground,
                          fontSize: 13,
                          textAlign: 'center',
                          marginBottom: 20,
                          paddingHorizontal: 16,
                        }}
                      >
                        Нажмите, чтобы включить камеру
                      </Text>
                      <PressableScale
                        onPress={startWebScanning}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 24,
                          backgroundColor: COLORS.primary,
                          borderRadius: RADIUS.md,
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Включить камеру</Text>
                      </PressableScale>
                      {webCameraError && (
                        <Text
                          style={{
                            color: '#B91C1C',
                            fontSize: 13,
                            marginTop: 12,
                            textAlign: 'center',
                          }}
                        >
                          {webCameraError}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View
                      style={{
                        borderRadius: RADIUS.lg,
                        overflow: 'hidden',
                        aspectRatio: 1,
                        marginBottom: 16,
                        position: 'relative',
                        backgroundColor: COLORS.muted,
                      }}
                    >
                      {/* biome-ignore lint/a11y/useMediaCaption: Camera preview has no audio track. */}
                      <video
                        ref={videoRef}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        playsInline
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      {/* Corner guides */}
                      {CORNER_GUIDES.map(({ id, ...style }) => (
                        <View
                          key={id}
                          style={[
                            {
                              position: 'absolute',
                              width: 28,
                              height: 28,
                              borderColor: 'white',
                            },
                            style,
                          ]}
                        />
                      ))}
                      {isSubmitting && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ActivityIndicator size="large" color="white" />
                        </View>
                      )}
                    </View>
                  )}
                </MotiView>
              )}

              {/* Camera view */}
              {!useManual && Platform.OS !== 'web' && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 400 }}
                >
                  {!permission?.granted ? (
                    <View
                      style={{
                        alignItems: 'center',
                        paddingVertical: 40,
                        backgroundColor: COLORS.muted,
                        borderRadius: RADIUS.lg,
                        marginBottom: 16,
                      }}
                    >
                      <Feather name="camera-off" size={40} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          color: COLORS.foreground,
                          fontWeight: '600',
                          fontSize: 15,
                          marginTop: 12,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        Нужен доступ к камере
                      </Text>
                      <Text
                        style={{
                          color: COLORS.mutedForeground,
                          fontSize: 13,
                          textAlign: 'center',
                          marginBottom: 20,
                          paddingHorizontal: 16,
                        }}
                      >
                        Разрешите доступ, чтобы отсканировать QR-код
                      </Text>
                      <PressableScale
                        onPress={requestPermission}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 24,
                          backgroundColor: COLORS.primary,
                          borderRadius: RADIUS.md,
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Разрешить камеру</Text>
                      </PressableScale>
                    </View>
                  ) : (
                    <View
                      style={{
                        borderRadius: RADIUS.lg,
                        overflow: 'hidden',
                        aspectRatio: 1,
                        marginBottom: 16,
                        position: 'relative',
                      }}
                    >
                      <CameraView
                        style={{ flex: 1 }}
                        facing="back"
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        onBarcodeScanned={({ data }) => handleQRData(data)}
                      />
                      {/* Corner guides */}
                      {CORNER_GUIDES.map(({ id, ...style }) => (
                        <View
                          key={id}
                          style={[
                            {
                              position: 'absolute',
                              width: 28,
                              height: 28,
                              borderColor: 'white',
                            },
                            style,
                          ]}
                        />
                      ))}
                      {isSubmitting && (
                        <View
                          style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ActivityIndicator size="large" color="white" />
                        </View>
                      )}
                    </View>
                  )}
                </MotiView>
              )}

              {/* Manual entry */}
              {useManual && (
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 400 }}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      padding: 32,
                      backgroundColor: COLORS.muted,
                      borderRadius: RADIUS.lg,
                      marginBottom: 20,
                    }}
                  >
                    <Feather name="grid" size={48} color={COLORS.primary} />
                    <Text
                      style={{
                        color: COLORS.mutedForeground,
                        fontSize: 13,
                        marginTop: 12,
                        textAlign: 'center',
                      }}
                    >
                      Введите 6-значный код
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: COLORS.foreground,
                      marginBottom: 8,
                    }}
                  >
                    6-значный код
                  </Text>
                  <TextInput
                    value={manualCode}
                    onChangeText={(text) => {
                      // Only allow digits and max 6 characters
                      const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
                      setManualCode(filtered);
                    }}
                    placeholder="000000"
                    placeholderTextColor={COLORS.mutedForeground}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      width: '100%',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: COLORS.muted,
                      borderRadius: RADIUS.md,
                      borderWidth: 2,
                      borderColor: COLORS.border,
                      fontSize: 24,
                      fontWeight: '700',
                      color: COLORS.foreground,
                      marginBottom: 16,
                      textAlign: 'center',
                      letterSpacing: 8,
                    }}
                  />

                  <PressableScale
                    onPress={() => processCode(manualCode)}
                    disabled={manualCode.length !== 6 || isSubmitting}
                    style={{
                      width: '100%',
                      paddingVertical: 16,
                      borderRadius: RADIUS.md,
                      alignItems: 'center',
                      backgroundColor:
                        manualCode.length !== 6 || isSubmitting ? COLORS.muted : COLORS.primary,
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.mutedForeground} />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: manualCode.length !== 6 ? COLORS.mutedForeground : 'white',
                        }}
                      >
                        Войти
                      </Text>
                    )}
                  </PressableScale>
                </MotiView>
              )}

              {/* Error */}
              {!!error && (
                <View
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: RADIUS.md,
                    backgroundColor: '#FEE2E2',
                  }}
                >
                  <Text
                    style={{
                      color: '#B91C1C',
                      fontWeight: '500',
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
