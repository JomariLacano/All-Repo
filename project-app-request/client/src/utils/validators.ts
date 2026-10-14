const PH_MOBILE_REGEX = /^(?:\+?63|0)9\d{2}[-\s]?\d{3}[-\s]?\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhMobile(value: string): boolean {
  return PH_MOBILE_REGEX.test(value.trim());
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
