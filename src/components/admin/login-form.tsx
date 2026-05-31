"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#c9a227] focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#c9a227] focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
