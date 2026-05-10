import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { SubscriptionPlan, SubscriptionPlanRole } from '$lib/subscriptionCatalog';

type CheckoutResponse = {
  url?: string;
  error?: string;
};

const TEMPORARY_PREDEFENSE_CHECKOUT_PATH = '/api/payments/predefense-stripe-sandbox-checkout';

export function isTemporaryPreDefenseStripeSandboxEnabled() {
  return process.env.EXPO_PUBLIC_TEMP_PREDEFENSE_STRIPE_SANDBOX_ENABLED === 'true';
}

function getApiBaseUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  return process.env.EXPO_PUBLIC_TEMP_PREDEFENSE_APP_BASE_URL?.trim() || 'http://localhost:8081';
}

function getReturnUrl(path: string, outcome: 'success' | 'cancel') {
  const query = `temporaryStripeSandbox=${outcome}`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${path}?${query}`;
  }

  const deepLink = Linking.createURL(path);
  return `${deepLink}${deepLink.includes('?') ? '&' : '?'}${query}`;
}

async function openCheckoutUrl(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(url);
    return;
  }

  await WebBrowser.openBrowserAsync(url);
}

export async function startTemporaryPreDefenseStripeSandboxCheckout(params: {
  plan: SubscriptionPlan;
  role: SubscriptionPlanRole;
  customerEmail?: string;
  clientReferenceId?: string;
}) {
  // TEMPORARY PRE-DEFENSE ONLY:
  // Stripe is only used here because the incomplete Atlas account gives us sandbox credentials.
  // This helper intentionally does not pretend to be the real production payment integration.
  if (!isTemporaryPreDefenseStripeSandboxEnabled()) {
    throw new Error('Temporary pre-defense Stripe sandbox checkout is disabled.');
  }

  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}${TEMPORARY_PREDEFENSE_CHECKOUT_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: params.plan.id,
      role: params.role,
      customerEmail: params.customerEmail,
      clientReferenceId: params.clientReferenceId,
      successUrl: getReturnUrl('/profile/common/done', 'success'),
      cancelUrl: getReturnUrl('/profile/common/subscribe', 'cancel'),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as CheckoutResponse;

  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Stripe sandbox checkout failed.');
  }

  await openCheckoutUrl(data.url);
}
