export const HANDLE_MIN = 2;
export const HANDLE_MAX = 16;

const HANDLE_PATTERN = /^[A-Za-z][A-Za-z0-9 _-]*$/;

const RESERVED = new Set([
  "ember",
  "rubyforge",
  "system",
  "admin",
  "google",
  "null",
  "undefined",
  "smith",
]);

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function suggestHandle(name: string | null | undefined): string {
  if (!name) return "";
  const first = name.split(/\s+/)[0] ?? "";
  const cleaned = first.replace(/[^A-Za-z0-9]/g, "");
  if (cleaned.length < HANDLE_MIN) return "";
  return cleaned.slice(0, HANDLE_MAX);
}

export function handleError(raw: string): string | null {
  const handle = normalizeHandle(raw);
  if (handle.length < HANDLE_MIN) return `At least ${HANDLE_MIN} characters.`;
  if (handle.length > HANDLE_MAX) return `Keep it to ${HANDLE_MAX} characters.`;
  if (!HANDLE_PATTERN.test(handle)) {
    return "Start with a letter. Letters, numbers, spaces, _ and - only.";
  }
  if (RESERVED.has(handle.toLowerCase())) return "That username is reserved.";
  return null;
}
