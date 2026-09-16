/**
 * Validates 13-digit Thai National Identification Number checksum
 * Algorithm:
 * 1. Multiply each of the first 12 digits by weights (13 down to 2).
 * 2. Sum the results.
 * 3. Take remainder mod 11.
 * 4. Checksum = (11 - remainder) mod 10.
 * 5. Compare checksum with the 13th digit.
 */
export function validateThaiNationalID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Clean hyphens or spaces
  const cleanId = id.replace(/[-\s]/g, '');

  if (!/^\d{13}$/.test(cleanId)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }

  const remainder = sum % 11;
  const checkDigit = (11 - remainder) % 10;

  return checkDigit === parseInt(cleanId.charAt(12), 10);
}
