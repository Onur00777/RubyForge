export const PASS_MIN = 4;
export const PASS_MAX = 64;

export function passError(raw: string): string | null {
  if (raw.length < PASS_MIN) return `Password: at least ${PASS_MIN} characters.`;
  if (raw.length > PASS_MAX) return `Password: keep it to ${PASS_MAX} characters.`;
  return null;
}
