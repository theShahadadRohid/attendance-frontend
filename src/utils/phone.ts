export function normalizeBangladeshPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  // 01712345678 -> +8801712345678
  if (/^01[3-9]\d{8}$/.test(digits)) {
    return `+880${digits.slice(1)}`;
  }

  // 8801712345678 -> +8801712345678
  if (/^8801[3-9]\d{8}$/.test(digits)) {
    return `+${digits}`;
  }

  throw new Error("Enter a valid Bangladeshi mobile number.");
}

export function toLocalPhoneNumber(value: string): string {
  return value.replace(/^\+880/, "0");
}
