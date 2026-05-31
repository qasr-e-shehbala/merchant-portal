import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/server/auth/session";

export async function getCurrentStaff(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireStaff(): Promise<SessionPayload> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/login");
  return staff;
}

const ROLE_RANK: Record<string, number> = {
  OWNER: 4,
  MANAGER: 3,
  SHOP_STAFF: 2,
  TAILOR: 1,
  CONTENT_EDITOR: 1,
};

export function hasAtLeastRole(role: string, minimum: string): boolean {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minimum] ?? 0);
}
