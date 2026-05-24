"use client";

import { useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";

const ROLE_COOKIE_NAME = "chapaworks_signup_role";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "artisan" ? "artisan" : "client";
  const inviteToken = searchParams.get("invite");
  const mode = role === "artisan" ? "artisan-sign-up" : "sign-up";

  useEffect(() => {
    document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=3600; SameSite=Lax`;
    if (inviteToken) {
      document.cookie = `chapaworks_invite_token=${inviteToken}; path=/; max-age=3600; SameSite=Lax`;
    }
  }, [inviteToken, role]);

  return (
    <AuthShell mode={mode}>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none border-0 p-0 w-full",
            card: "shadow-none border-0 p-0 w-full",
          },
        }}
      />
    </AuthShell>
  );
}
