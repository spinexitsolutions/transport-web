// Edge-compatible helpers (used by middleware and route handlers)
export const SESSION_COOKIE = "kinetik_admin";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@kinetik.in";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kinetik@2026";
const SECRET = process.env.AUTH_SECRET || "kinetik-demo-secret-change-me";

export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}:${SECRET}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(token?: string | null) {
  if (!token) return false;
  return token === (await sessionToken());
}
