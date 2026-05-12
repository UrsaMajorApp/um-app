// Экран профиля common: показывает выбор подписки и запуск оплаты для роли common.
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { type UserRole, useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { useSubscriptionPlans } from '$hooks/usePlatformData';
import {
  updateSubscriptionRequestStatus,
  useYouthSubscriptionRequests,
} from '$hooks/useSubscriptionRequests';
import { formatSubscriptionPrice } from '$lib/formatCurrency';
import type { SubscriptionPlan, SubscriptionPlanRole } from '$lib/subscriptionCatalog';
import {
  isTemporaryPreDefenseStripeSandboxEnabled,
  startTemporaryPreDefenseStripeSandboxCheckout,
} from '$lib/temporaryPreDefenseStripeSandbox';
import { isWebMinWidth } from '$lib/useIsDesktop';

const { width } = Dimensions.get('window');
const IS_DESKTOP = isWebMinWidth(width, 900);

function planKey(role: UserRole) {
  return `subscription_plan_${role}`;
}

function paymentRole(role: UserRole | null): SubscriptionPlanRole | null {
  if (role === 'child' || role === 'young-adult' || role === 'youth') return 'youth';
  if (role === 'parent' || role === 'org') return role;
  return null;
}

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function planActionLabel(params: {
  isCheckoutLoading: boolean;
  isSelected: boolean;
  isPaid: boolean;
  isYouthRequestFlow: boolean;
  isRequestPending: boolean;
  isRequestedPlan: boolean;
  stripeSandboxEnabled: boolean;
}) {
  if (params.isCheckoutLoading) return 'открываем Stripe Sandbox...';
  if (params.isYouthRequestFlow && params.isRequestPending) return 'запрос отправлен';
  if (params.isYouthRequestFlow) return 'запросить у родителя';
  if (params.isRequestedPlan && params.isPaid) return 'оплатить запрос';
  if (params.isSelected) return 'оставить выбранным';
  if (params.isPaid && params.stripeSandboxEnabled) return 'оплатить в Stripe Sandbox';
  return 'выбрать';
}

type PlanCardProps = {
  plan: SubscriptionPlan;
  index: number;
  role: UserRole | null;
  selected: string | null;
  checkoutPlanId: string | null;
  pendingPlanIds: string[];
  requestedPlanId: string | null;
  requestedPlanTitle: string | null;
  stripeSandboxEnabled: boolean;
  paymentError: { planId: string; message: string } | null;
  onChoose: (plan: SubscriptionPlan) => void;
};

function SubscribePlanCard(props: PlanCardProps) {
  const {
    plan,
    index,
    role,
    selected,
    checkoutPlanId,
    pendingPlanIds,
    requestedPlanId,
    requestedPlanTitle,
    stripeSandboxEnabled,
    paymentError,
    onChoose,
  } = props;
  const isSelected = selected === plan.title;
  const isPopular = plan.popular === true;
  const isPaid = plan.price_kzt > 0 && plan.billing_period !== 'free';
  const isCheckoutLoading = checkoutPlanId === plan.id;
  const isRequestPending = pendingPlanIds.includes(plan.id);
  const isRequestedPlan =
    requestedPlanId === plan.id ||
    (requestedPlanTitle !== null && requestedPlanTitle === plan.title);
  const isYouthRequestFlow = role === 'youth' && isPaid;
  const actionLabel = planActionLabel({
    isCheckoutLoading,
    isSelected,
    isPaid,
    isYouthRequestFlow,
    isRequestPending,
    isRequestedPlan,
    stripeSandboxEnabled,
  });

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 350, delay: index * 120 }}
      style={{
        backgroundColor: 'white',
        borderRadius: 26,
        padding: 22,
        marginBottom: 24,
        borderWidth: isPopular || isSelected || isRequestedPlan ? 2 : 1,
        borderColor: isSelected
          ? '#6C5CE7'
          : isRequestedPlan
            ? '#F59E0B'
            : isPopular
              ? '#6C5CE7'
              : 'rgba(15, 23, 42, 0.08)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {isRequestedPlan ? (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 10,
              marginBottom: 10,
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Feather name="bell" size={14} color="#92400E" />
            <Text style={{ color: '#92400E', fontSize: 12 }}>запрошен</Text>
          </View>
        ) : null}
      </View>

      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 6 }}>{plan.title}</Text>

      <Text style={{ fontSize: 18, fontWeight: '800', color: '#6C5CE7', marginBottom: 16 }}>
        {formatSubscriptionPrice(plan.price_kzt, plan.billing_period)}
      </Text>

      {isPaid && stripeSandboxEnabled ? (
        <Text style={{ color: '#71717A', fontSize: 12, marginTop: -8, marginBottom: 14 }}>
          Stripe Sandbox: тестовая оплата, реальные списания не выполняются.
        </Text>
      ) : null}

      {plan.features.map((feature) => (
        <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Feather name="check" size={18} color="#6C5CE7" />
          <Text style={{ marginLeft: 10, fontSize: 15 }}>{feature}</Text>
        </View>
      ))}

      <TouchableOpacity
        disabled={isCheckoutLoading || isRequestPending}
        onPress={() => onChoose(plan)}
        style={{
          backgroundColor: isRequestPending ? '#A1A1AA' : '#6C5CE7',
          marginTop: 20,
          paddingVertical: 14,
          borderRadius: 999,
          opacity: isCheckoutLoading ? 0.72 : 1,
        }}
      >
        <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>
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
}

export default function SubscribeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    requestedPlanId?: string | string[];
    requestedPlanTitle?: string | string[];
    subscriptionRequestId?: string | string[];
    requestedBy?: string | string[];
  }>();
  const { user } = useAuth();
  const { activeChildId, childrenProfile } = useParentData();
  const [role, setRole] = useState<UserRole | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<{ planId: string; message: string } | null>(
    null,
  );
  const requestedPlanId = firstParam(params.requestedPlanId);
  const requestedPlanTitle = firstParam(params.requestedPlanTitle);
  const subscriptionRequestId = firstParam(params.subscriptionRequestId);
  const requestedBy = firstParam(params.requestedBy);
  const { plans, loading } = useSubscriptionPlans(role);
  const activeChild = childrenProfile.find((child) => child.id === activeChildId);
  const youthSubscriptionRequests = useYouthSubscriptionRequests({
    user: role === 'youth' ? user : null,
    activeChild,
  });
  const stripeSandboxEnabled = isTemporaryPreDefenseStripeSandboxEnabled();

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
      return;
    }

    AsyncStorage.getItem('user_role').then((v) => setRole((v as UserRole) || 'parent'));
  }, [user?.role]);

  useEffect(() => {
    if (!role) return;
    AsyncStorage.getItem(planKey(role)).then((v) => setSelected(v));
  }, [role]);

  async function choosePlan(title: string) {
    if (!role) return;
    await AsyncStorage.setItem(planKey(role), title);
    setSelected(title);
    await updateSubscriptionRequestStatus(subscriptionRequestId, 'approved');
    router.replace('/(tabs)/home'); // после выбора подписки отправляем на home (первый таб)
  }

  async function choosePaidPlan(plan: SubscriptionPlan) {
    const roleForPayment = paymentRole(role);

    if (!role || !roleForPayment) return;

    if (plan.price_kzt <= 0 || plan.billing_period === 'free' || !stripeSandboxEnabled) {
      await choosePlan(plan.title);
      return;
    }

    if (role === 'youth') {
      const result = await youthSubscriptionRequests.requestPlan(plan);
      if (result.ok) {
        Alert.alert(
          'Запрос отправлен',
          'Родитель увидит его в профиле и сможет активировать подписку.',
        );
        return;
      }

      setPaymentError({
        planId: plan.id,
        message: result.error || 'Не удалось отправить запрос родителю.',
      });
      return;
    }

    setPaymentError(null);
    setCheckoutPlanId(plan.id);

    try {
      await startTemporaryPreDefenseStripeSandboxCheckout({
        plan,
        role: roleForPayment,
        clientReferenceId: subscriptionRequestId
          ? `${roleForPayment}:${plan.id}:request:${subscriptionRequestId}`
          : `${roleForPayment}:${plan.id}`,
      });
      await AsyncStorage.setItem(planKey(role), plan.title);
      await updateSubscriptionRequestStatus(subscriptionRequestId, 'approved');
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

          {role === 'youth' ? (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: 18,
                padding: 16,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.6)',
              }}
            >
              <Text style={{ color: '#312E81', fontWeight: '800', fontSize: 14 }}>
                Платные планы отправляются родителю на подтверждение.
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4, fontSize: 12 }}>
                Для young adult аккаунта оплата остается прямой через Stripe Sandbox.
              </Text>
            </View>
          ) : null}

          {subscriptionRequestId ? (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderRadius: 18,
                padding: 16,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: '#FDE68A',
              }}
            >
              <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 14 }}>
                Запрос на подписку{requestedBy ? ` от ${requestedBy}` : ''}
              </Text>
              <Text style={{ color: '#92400E', marginTop: 4, fontSize: 12 }}>
                После открытия Stripe Sandbox запрос будет отмечен как одобренный.
              </Text>
            </View>
          ) : null}

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

          {plans.map((plan, index) => (
            <SubscribePlanCard
              key={plan.id}
              plan={plan}
              index={index}
              role={role}
              selected={selected}
              checkoutPlanId={checkoutPlanId}
              pendingPlanIds={youthSubscriptionRequests.pendingPlanIds}
              requestedPlanId={requestedPlanId}
              requestedPlanTitle={requestedPlanTitle}
              stripeSandboxEnabled={stripeSandboxEnabled}
              paymentError={paymentError}
              onChoose={choosePaidPlan}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
