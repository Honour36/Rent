/**
 * Phone validation for Zimbabwean and international numbers.
 * Zimbabwe mobile: +263 7X XXX XXXX or 07X XXX XXXX (10 digits local)
 * International: E.164 format +[country][subscriber] (min 7, max 15 digits)
 */

export interface PhoneValidationResult {
  valid: boolean;
  formatted?: string;
  message?: string;
}

// Strip spaces, dashes, dots, parentheses
function normalise(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

export function validatePhone(raw: string): PhoneValidationResult {
  if (!raw || !raw.trim()) return { valid: true }; // optional field — blank is fine

  const n = normalise(raw);

  // Must be digits only (after normalise) optionally starting with +
  if (!/^\+?\d+$/.test(n)) {
    return { valid: false, message: 'Phone number must contain only digits.' };
  }

  const digits = n.replace(/^\+/, '');

  // Too short
  if (digits.length < 7) {
    return { valid: false, message: 'Phone number is too short — at least 7 digits required.' };
  }

  // Too long
  if (digits.length > 15) {
    return { valid: false, message: 'Phone number is too long — maximum 15 digits.' };
  }

  // Zimbabwe mobile: 07XXXXXXXX (10 digits) or +2637XXXXXXX (12 digits)
  if (n.startsWith('+263') || n.startsWith('263')) {
    const local = digits.startsWith('263') ? digits.slice(3) : digits;
    if (local.length !== 9 || !/^[7][0-9]{8}$/.test(local)) {
      return { valid: false, message: 'Zimbabwean number should be +263 7X XXX XXXX (9 digits after +263).' };
    }
    return { valid: true, formatted: `+263 ${local.slice(0,2)} ${local.slice(2,5)} ${local.slice(5)}` };
  }

  // Local Zim format: 07XXXXXXXX
  if (n.startsWith('07') && digits.length === 10) {
    const local = digits.slice(1);
    return { valid: true, formatted: `+263 ${local.slice(0,2)} ${local.slice(2,5)} ${local.slice(5)}` };
  }

  // International — accept anything 7-15 digits
  if (digits.length >= 7 && digits.length <= 15) {
    return { valid: true };
  }

  return { valid: false, message: `Phone number looks incomplete (${digits.length} digits). Please check.` };
}
