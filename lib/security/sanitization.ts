import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes rich text / HTML input to prevent XSS vulnerability
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitizes raw string parameters for log safety
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
