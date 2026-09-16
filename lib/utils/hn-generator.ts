/**
 * Formats or generates standard Klinik Hospital Numbers (HN)
 * Format: HN-YYMMDD-XXXX (e.g. HN-690916-0001)
 */
export function generateHN(sequenceNumber: number, date: Date = new Date()): string {
  const yearBE = (date.getFullYear() + 543).toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const seq = sequenceNumber.toString().padStart(4, '0');

  return `HN-${yearBE}${month}${day}-${seq}`;
}

/**
 * Validates HN format regex
 */
export function validateHNFormat(hn: string): boolean {
  return /^HN-\d{6}-\d{4}$/.test(hn);
}
