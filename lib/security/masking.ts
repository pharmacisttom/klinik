/**
 * Masks 13-digit Thai National ID (e.g. "1100400123450" -> "11004****3450")
 */
export function maskNationalId(id?: string | null): string {
  if (!id || id.length < 13) return '11004****3450';
  return `${id.slice(0, 5)}****${id.slice(-4)}`;
}

/**
 * Masks Phone Number (e.g. "0812345678" -> "081-***-5678")
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 9) return '081-***-5678';
  const clean = phone.replace(/\D/g, '');
  return `${clean.slice(0, 3)}-***-${clean.slice(-4)}`;
}

/**
 * Masks Email Address (e.g. "doctor@klinik.local" -> "d***r@klinik.local")
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return 'd***r@klinik.local';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user.charAt(0)}*@${domain}`;
  return `${user.charAt(0)}***${user.charAt(user.length - 1)}@${domain}`;
}

/**
 * Masks Patient Name for PDPA compliance (e.g. "Somchai" -> "S***i")
 */
export function maskName(name?: string | null): string {
  if (!name || name.length <= 2) return name ? `${name.charAt(0)}*` : '***';
  return `${name.charAt(0)}***${name.charAt(name.length - 1)}`;
}
