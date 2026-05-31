"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { createSessionToken, SESSION_COOKIE } from "@/server/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  callbackUrl: z.string().optional(),
});

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password" };

  const { email, password, callbackUrl } = parsed.data;

  let token: string;
  try {
    const staff = await prisma.staff.findFirst({ where: { email, isActive: true } });
    if (!staff?.passwordHash || !(await compare(password, staff.passwordHash))) {
      return { error: "Invalid email or password" };
    }
    token = await createSessionToken({ staffId: staff.id, role: staff.role, name: staff.name });
  } catch {
    return { error: "Sign-in is unavailable right now. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
