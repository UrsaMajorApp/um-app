import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSubscriptionPlans } from '$hooks/usePlatformData';
import { formatSubscriptionPrice } from '$lib/formatCurrency';
import type { SubscriptionPlan, SubscriptionPlanRole } from '$lib/subscriptionCatalog';
import {
  isTemporaryPreDefenseStripeSandboxEnabled,
  startTemporaryPreDefenseStripeSandboxCheckout,
} from '$lib/temporaryPreDefenseStripeSandbox';
import { isWebMinWidth } from '$lib/useIsDesktop';
import type { SubscriptionRole } from '$types/auth';

const { width } = Dimensions.get('window');
const IS_DESKTOP = isWebMinWidth(width, 900);

function planKey(role: SubscriptionRole) {
  return `subscription_plan_${role}`;
}

function paymentRole(role: SubscriptionRole | null): SubscriptionPlanRole | null {
  if (role === 'child' || role === 'young-adult' || role === 'youth') return 'youth';
  if (role === 'parent' || role === 'org') return role;
  return null;
}

function planActionLabel(params: {
  isCheckoutLoading: boolean;
  isSelected: boolean;
  isPaid: boolean;
  stripeSandboxEnabled: boolean;
}) {
  if (params.isCheckoutLoading) return 'открываем Stripe Sandbox...';
  if (params.isSelected) return 'оставить выбранным';
  if (params.isPaid && params.stripeSandboxEnabled) return 'оплатить в Stripe Sandbox';
  return 'выбрать';
}

export default function SubscribeScreen() {
  const router = useRouter();
  const [role, setRole] = useState<SubscriptionRole | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<{ planId: string; message: string } | null>(
    null,
  );
  const { plans, loading } = useSubscriptionPlans(role);
  const stripeSandboxEnabled = isTemporaryPreDefenseStripeSandboxEnabled();

  useEffect(() => {
    AsyncStorage.getItem('user_role').then((v) => setRole((v as SubscriptionRole) || 'parent'));
  }, []);

  useEffect(() => {
    if (!role) return;
    AsyncStorage.getItem(planKey(role)).then((v) => setSelected(v));
  }, [role]);

  async function choosePlan(title: string) {
    if (!role) return;
    await AsyncStorage.setItem(planKey(role), title);
    setSelected(title);
    router.replace('/(tabs)/home'); // после выбора подписки отправляем на home (первый таб)
  }

  async function choosePaidPlan(plan: SubscriptionPlan) {
    const roleForPayment = paymentRole(role);

    if (!role || !roleForPayment) return;

    if (plan.price_kzt <= 0 || plan.billing_period === 'free' || !stripeSandboxEnabled) {
      await choosePlan(plan.title);
      return;
    }

    setPaymentError(null);
    setCheckoutPlanId(plan.id);

    try {
      await startTemporaryPreDefenseStripeSandboxCheckout({
        plan,
        role: roleForPayment,
        clientReferenceId: `${roleForPayment}:${plan.id}`,
      });
      await AsyncStorage.setItem(planKey(role), plan.title);
      setSelected(plan.title);
    } catch (error) {
      setPaymentError({
        planId: plan.id,
        message: error instanceof Error ? error.message : 'Не удалось открыть Stripe Sandbox.',
      });
    } finally {
      setCheckoutPlanId(null);
    }
  }

  return (
    <LinearGradient colors={['#6C5CE7', '#ECEBFF']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: 120,
          paddingHorizontal: 20,
          alignItems: IS_DESKTOP ? 'center' : 'stretch',
        }}
      >
        <View style={{ width: IS_DESKTOP ? '50%' : '100%' }}>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{ alignItems: 'center', marginBottom: 10 }}
          >
            <Image
              source={require('../../../assets/logo/logo_white.png')}
              style={{ width: 160, height: 120, resizeMode: 'contain' }}
            />
          </MotiView>

          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              textAlign: 'center',
              color: 'white',
              marginBottom: 10,
            }}
          >
            Подписки
          </Text>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              opacity: 0.8,
              color: 'white',
              marginBottom: 28,
            }}
          >
            выберите подходящий план
          </Text>

          {!loading && plans.length === 0 && (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Feather name="credit-card" size={28} color="#A1A1AA" />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  color: '#71717A',
                  textAlign: 'center',
                }}
              >
                Для этой роли пока нет активных тарифов.
              </Text>
            </View>
          )}

          {plans.map((plan, index) => {
            const isSelected = selected === plan.title;
            const isPopular = plan.popular === true;
            const isPaid = plan.price_kzt > 0 && plan.billing_period !== 'free';
            const isCheckoutLoading = checkoutPlanId === plan.id;
            const actionLabel = planActionLabel({
              isCheckoutLoading,
              isSelected,
              isPaid,
              stripeSandboxEnabled,
            });

            return (
              <MotiView
                key={plan.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 350, delay: index * 120 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 26,
                  padding: 22,
                  marginBottom: 24,
                  borderWidth: isPopular || isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? '#6C5CE7'
                    : isPopular
                      ? '#6C5CE7'
                      : 'rgba(15, 23, 42, 0.08)',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {isPopular ? (
                    <View
                      style={{
                        backgroundColor: '#6C5CE7',
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>популярный</Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {isSelected ? (
                    <View
                      style={{
                        backgroundColor: '#6C5CE7',
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                        flexDirection: 'row',
                        gap: 6,
                        alignItems: 'center',
                      }}
                    >
                      <Feather name="check" size={14} color="white" />
                      <Text style={{ color: 'white', fontSize: 12 }}>выбран</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 6 }}>
                  {plan.title}
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#6C5CE7',
                    marginBottom: 16,
                  }}
                >
                  {formatSubscriptionPrice(plan.price_kzt, plan.billing_period)}
                </Text>

                {isPaid && stripeSandboxEnabled ? (
                  <Text
                    style={{
                      color: '#71717A',
                      fontSize: 12,
                      marginTop: -8,
                      marginBottom: 14,
                    }}
                  >
                    Stripe Sandbox: тестовая оплата, реальные списания не выполняются.
                  </Text>
                ) : null}

                {plan.features.map((f) => (
                  <View
                    key={f}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Feather name="check" size={18} color="#6C5CE7" />
                    <Text style={{ marginLeft: 10, fontSize: 15 }}>{f}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  disabled={isCheckoutLoading}
                  onPress={() => choosePaidPlan(plan)}
                  style={{
                    backgroundColor: isSelected ? '#6C5CE7' : '#6C5CE7',
                    marginTop: 20,
                    paddingVertical: 14,
                    borderRadius: 999,
                    opacity: isCheckoutLoading ? 0.72 : 1,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {actionLabel}
                  </Text>
                </TouchableOpacity>

                {paymentError?.planId === plan.id && checkoutPlanId === null ? (
                  <Text
                    selectable
                    style={{ color: '#B91C1C', fontSize: 12, textAlign: 'center', marginTop: 10 }}
                  >
                    {paymentError.message}
                  </Text>
                ) : null}
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
