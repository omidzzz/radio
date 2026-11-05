/**
 * Convert English/Arabic numerals to Farsi (Persian) digits.
 */
export function toFarsiDigits(value: string | number): string {
  const str = String(value);
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (d) => farsiDigits[Number(d)]);
}

/**
 * Convert Farsi digits back to English numerals.
 */
export function fromFarsiDigits(value: string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return value.replace(/[۰-۹]/g, (d) => String(farsiDigits.indexOf(d)));
}