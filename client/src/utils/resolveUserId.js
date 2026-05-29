/**
 * Normalize user id for comparisons (string, ObjectId-like, or JWT buffer object).
 */
export function resolveUserId(raw) {
  if (!raw) return null;
  if (typeof raw === "string") return raw;

  if (raw.buffer && typeof raw.buffer === "object") {
    const bytes = Object.keys(raw.buffer)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw.buffer[key]);
    const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex.length === 24 ? hex : null;
  }

  if (typeof raw.toString === "function") {
    const asString = raw.toString();
    if (/^[a-f\d]{24}$/i.test(asString)) return asString;
  }

  return null;
}

export function isSameUser(recordUser, currentUserId) {
  const a = resolveUserId(recordUser);
  const b = resolveUserId(currentUserId);
  return Boolean(a && b && a === b);
}
