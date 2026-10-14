/**
 * Formats a positive integer with its correct English ordinal suffix.
 * Handles the 11th/12th/13th special cases correctly (not "11st", "12nd", "13rd").
 *
 * Examples: 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th",
 *           12 -> "12th", 13 -> "13th", 21 -> "21st", 22 -> "22nd".
 */
export function formatOrdinal(value: number): string {
  const n = Math.trunc(Math.abs(value));
  const remainder100 = n % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${n}th`;
  }

  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
