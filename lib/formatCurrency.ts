export function formatKZT(amount: number): string {
  if (!Number.isFinite(amount)) return '0 ₸';
  return `${Math.round(amount).toLocaleString('ru-RU')} ₸`;
}

export function formatBillingPeriodLabel(period: string): string {
  switch (period) {
    case 'month':
      return 'мес';
    case 'quarter':
      return 'квартал';
    default:
      return period;
  }
}

export function formatSubscriptionPrice(priceKzt: number, billingPeriod: string): string {
  if (priceKzt <= 0 || billingPeriod === 'free') return formatKZT(priceKzt);
  return `${formatKZT(priceKzt)} / ${formatBillingPeriodLabel(billingPeriod)}`;
}
