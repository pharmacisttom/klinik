/**
 * Formats a number into Thai Baht currency (e.g., ฿1,250.00)
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a Date object into Thai Buddhist Era date string (e.g., 16 ก.ย. 2569)
 */
export function formatThaiDate(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Formats date to Thai DateTime (e.g., 16 ก.ย. 2569 14:30 น.)
 */
export function formatThaiDateTime(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return `${new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)} น.`;
}
