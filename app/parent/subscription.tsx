import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SideNav } from '$components/navigation/SideNav';
import { SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useSubscriptionPlans } from '$hooks/usePlatformData';
import { formatKZT } from '$lib/formatCurrency';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function SubscriptionPaywall() {
  const router = useRouter();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const { plans } = useSubscriptionPlans('parent');
  const plan = plans.find((item) => item.popular) ?? plans[0] ?? null;

  const handleSubscribe = () => {
    router.push('/profile/common/subscribe');
  };

  const content = (
    <View style={styles.contentArea}>
      {/* Ambient blobs */}
      <View
        style={[styles.blob, { top: -80, left: -80, backgroundColor: 'rgba(139,92,246,0.18)' }]}
      />
      <View
        style={[styles.blob, { bottom: -80, right: -80, backgroundColor: 'rgba(56,189,248,0.12)' }]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Close button */}
        <View style={[styles.topBar, { paddingHorizontal: isDesktop ? 40 : 20 }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color="white" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: isDesktop ? 60 : 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* Hero */}
            <View style={styles.heroSection}>
              <View style={styles.zapIcon}>
                <Feather name="zap" size={30} color="#A78BFA" />
              </View>
              <Text style={styles.heroTitle}>Раскройте 100%{'\n'}потенциала ребенка</Text>
              <Text style={styles.heroSubtitle}>
                Оформите подписку PRO, чтобы получить индивидуальный план развития и доступ ко всем
                премиум-функциям.
              </Text>
            </View>

            {/* Feature list */}
            <View style={styles.featureCard}>
              {(plan?.features ?? []).map((feature, idx, features) => (
                <View
                  key={feature}
                  style={[styles.featureRow, idx < features.length - 1 && { marginBottom: 20 }]}
                >
                  <View style={styles.featureIcon}>
                    <Feather name="check-circle" size={20} color="#A78BFA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureTitle}>{feature}</Text>
                  </View>
                </View>
              ))}
              {!plan && <Text style={styles.featureDesc}>Активных тарифов пока нет.</Text>}
            </View>

            {/* Pricing card */}
            <View style={styles.pricingCard}>
              <LinearGradient
                colors={['#7C3AED', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pricingGradient}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.pricingLabel}>{plan?.title ?? 'Тариф'}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{plan ? formatKZT(plan.price_kzt) : '—'}</Text>
                  <Text style={styles.priceUnit}> / мес</Text>
                </View>

                <Pressable
                  disabled={!plan}
                  onPress={handleSubscribe}
                  style={({ pressed }) => [styles.kaspiBtn, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.kaspiText}>Выбрать тариф</Text>
                </Pressable>

                <View style={styles.secureRow}>
                  <Feather name="lock" size={11} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.secureText}>Безопасный платеж</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Free tier */}
            <Pressable onPress={() => router.back()} style={styles.freeBtn}>
              <Text style={styles.freeText}>Продолжить на бесплатном (Basic)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <SideNav role={user?.role || 'parent'} />
        <View style={{ flex: 1 }}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  topBar: {
    paddingTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scroll: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 560,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  zapIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 380,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 3,
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 16,
  },
  pricingCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.lg,
  },
  pricingGradient: {
    padding: 28,
  },
  pricingLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceAmount: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
  },
  priceUnit: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    fontWeight: '700',
  },
  kaspiBtn: {
    backgroundColor: 'white',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  kaspiText: {
    color: '#6D28D9',
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.6,
  },
  secureText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  freeBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  freeText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    fontSize: 14,
  },
});
