// API оплаты: создает временную Stripe sandbox-ссылку для демонстрации покупки подписки.
import { getSubscriptionPlanById, type SubscriptionPlanRole } from '$lib/subscriptionCatalog';

const STRIPE_CHECKOUT_SESSIONS_ENDPOINT = 'https://api.stripe.com/v1/checkout/sessions';

type CheckoutRequestBody = {
  planId?: string;
  role?: SubscriptionPlanRole;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  clientReferenceId?: string;
};

function isTemporaryPreDefenseStripeSandboxEnabled() {
  return (
    process.env.EXPO_PUBLIC_TEMP_PREDEFENSE_STRIPE_SANDBOX_ENABLED === 'true' ||
    process.env.TEMP_PREDEFENSE_STRIPE_SANDBOX_ENABLED === 'true'
  );
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function appendRecurringParams(params: URLSearchParams, billingPeriod: string) {
  if (billingPeriod === 'quarter') {
    params.set('line_items[0][price_data][recurring][interval]', 'month');
    params.set('line_items[0][price_data][recurring][interval_count]', '3');
    return;
  }

  params.set('line_items[0][price_data][recurring][interval]', 'month');
}

function fallbackReturnUrl(request: Request, outcome: 'success' | 'cancel') {
  const url = new URL(request.url);
  url.pathname = outcome === 'success' ? '/profile/common/done' : '/profile/common/subscribe';
  url.search = `?temporaryStripeSandbox=${outcome}`;
  return url.toString();
}

export async function POST(request: Request) {
  // TEMPORARY PRE-DEFENSE ONLY:
  // This endpoint uses Stripe sandbox/test-mode credentials from an incomplete Atlas setup.
  // It must not be treated as the real Kazakhstan production payment processor.
  // Replace this provider with CloudPayments/Freedom Pay/PayBox/Kaspi before launch.
  if (!isTemporaryPreDefenseStripeSandboxEnabled()) {
    return jsonError('Temporary pre-defense Stripe sandbox checkout is disabled.', 503);
  }

  const stripeSecretKey = process.env.TEMP_PREDEFENSE_STRIPE_SANDBOX_SECRET_KEY?.trim();

  if (!stripeSecretKey?.startsWith('sk_test_')) {
    return jsonError('Temporary pre-defense Stripe sandbox secret key is missing.', 500);
  }

  const body = (await request.json().catch(() => ({}))) as CheckoutRequestBody;
  const role = body.role;
  const planId = body.planId;

  if (!role || !planId) {
    return jsonError('Missing role or planId.', 400);
  }

  const plan = getSubscriptionPlanById(role, planId);

  if (!plan) {
    return jsonError('Unknown pre-defense subscription plan.', 400);
  }

  if (plan.price_kzt <= 0 || plan.billing_period === 'free') {
    return jsonError('Free plans do not need Stripe Checkout.', 400);
  }

  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('payment_method_types[0]', 'card');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'kzt');
  // Stripe expects KZT in minor units because KZT is not a zero-decimal currency.
  params.set('line_items[0][price_data][unit_amount]', String(plan.price_kzt * 100));
  params.set('line_items[0][price_data][product_data][name]', `UM ${plan.title}`);
  params.set(
    'line_items[0][price_data][product_data][description]',
    'Temporary pre-defense Stripe sandbox checkout. No real transactions are processed.',
  );
  appendRecurringParams(params, plan.billing_period);
  params.set('success_url', body.successUrl || fallbackReturnUrl(request, 'success'));
  params.set('cancel_url', body.cancelUrl || fallbackReturnUrl(request, 'cancel'));
  params.set('metadata[temporary_predefense_only]', 'true');
  params.set('metadata[payment_provider]', 'stripe_sandbox');
  params.set('metadata[subscription_plan_id]', plan.id);
  params.set('metadata[subscription_plan_title]', plan.title);
  params.set('metadata[subscription_role]', plan.role);

  if (body.customerEmail) params.set('customer_email', body.customerEmail);
  if (body.clientReferenceId) params.set('client_reference_id', body.clientReferenceId);

  const stripeResponse = await fetch(STRIPE_CHECKOUT_SESSIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = (await stripeResponse.json().catch(() => ({}))) as {
    url?: string;
    error?: { message?: string };
  };

  if (!stripeResponse.ok || !data.url) {
    return jsonError(data.error?.message || 'Stripe sandbox checkout failed.', 502);
  }

  return Response.json({
    url: data.url,
    temporaryPreDefenseOnly: true,
    provider: 'stripe_sandbox',
  });
}
