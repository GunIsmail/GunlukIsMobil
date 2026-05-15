const COUNTRY_CODE = '+90';

/**
 * TR mobil için "+90 5XX XXX XX XX" formatı.
 * Kullanıcının girdiği herhangi bir metni temizler ve formatlar.
 */
export const formatTrPhone = (input: string): string => {
  const digits = input.replace(/\D/g, '');
  // Kullanıcı "+90", "0", boşluk vb. ile başlamış olabilir — normalize et.
  let local = digits;
  if (local.startsWith('90')) local = local.slice(2);
  else if (local.startsWith('0')) local = local.slice(1);
  local = local.slice(0, 10);

  const parts: string[] = [];
  if (local.length > 0) parts.push(local.slice(0, 3));
  if (local.length > 3) parts.push(local.slice(3, 6));
  if (local.length > 6) parts.push(local.slice(6, 8));
  if (local.length > 8) parts.push(local.slice(8, 10));

  return parts.length === 0 ? `${COUNTRY_CODE} ` : `${COUNTRY_CODE} ${parts.join(' ')}`;
};

/**
 * Sadece TR mobil hatları: "5" ile başlayan 10 haneli yerel numara.
 */
export const isValidTrPhone = (formatted: string): boolean => {
  const digits = formatted.replace(/\D/g, '');
  if (digits.length !== 12) return false;
  if (!digits.startsWith('90')) return false;
  const local = digits.slice(2);
  return local.startsWith('5');
};

/** API'ya gönderilecek E.164 formatı: +905XXXXXXXXX */
export const toE164 = (formatted: string): string => {
  const digits = formatted.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('90') ? `+${digits}` : '';
};
