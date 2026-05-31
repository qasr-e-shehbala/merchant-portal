import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "qes_session";
const SESSION_DURATION = "7d";

export interface SessionPayload {
  staffId: string;
  role: string;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      staffId: payload.staffId as string,
      role: payload.role as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
