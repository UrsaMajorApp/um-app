// Phone formatter: приводит телефон к читаемой маске во время ввода.
/**
 * Formats a phone number string into `+7 777 777 7777` style as the user types.
 * Strips everything except digits and a leading +.
 */
export function formatPhone(text: string): string {
  const cleaned = text.replace(/[^\d+]/g, '');
  const hasPlus = cleaned.startsWith('+');
  const digitsOnly = cleaned.replace(/\D/g, '');

  if (digitsOnly.length === 0) return hasPlus ? '+' : '';
  if (digitsOnly.length === 1) return hasPlus ? `+${digitsOnly}` : digitsOnly;

  const cc = hasPlus ? `+${digitsOnly[0]}` : digitsOnly[0];

  if (digitsOnly.length <= 4) return `${cc} ${digitsOnly.slice(1)}`;
  if (digitsOnly.length <= 7) return `${cc} ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4)}`;

  return `${cc} ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 11)}`;
}
