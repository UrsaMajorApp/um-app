export function formatKZT(amount: number): string {
  if (!Number.isFinite(amount)) return '0 ₸';
  return `${Math.round(amount).toLocaleString('ru-RU')} ₸`;
}
