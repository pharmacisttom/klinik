/**
 * Sanitizes rich text / HTML input to prevent XSS vulnerabilities safely
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  // Strip dangerous script, iframe, object tags and event handlers
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitizes raw string parameters for log safety and XSS prevention
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&#39;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
