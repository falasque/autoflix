/** Formats Brazilian local numbers and preserves numbers already using a country code. */
export function normalizeWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}
