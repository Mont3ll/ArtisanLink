"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe2, KeyRound, Loader2, LockKeyhole, Mail } from "lucide-react";

import { AuthPreviewShell } from "@/components/auth/auth-preview-shell";
import { COLORS } from "@/lib/design-tokens";

const ROLE_COOKIE_NAME = "chapaworks_signup_role";

function Divider() {
  return <div className="my-5 flex items-center gap-3 text-[13px]" style={{ color: COLORS.muted }}><span className="h-px flex-1" style={{ background: COLORS.hairlineSoft }} />or<span className="h-px flex-1" style={{ background: COLORS.hairlineSoft }} /></div>;
}

function PrimaryButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return <button disabled={disabled} className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60" style={{ background: COLORS.primary }}>{children}</button>;
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const role = inviteToken || searchParams.get("role") === "artisan" ? "artisan" : "client";
  const isArtisan = role === "artisan";

  useEffect(() => {
    document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=3600; SameSite=Lax`;
    if (inviteToken) document.cookie = `chapaworks_invite_token=${inviteToken}; path=/; max-age=3600; SameSite=Lax`;
  }, [inviteToken, role]);

  return (
    <AuthPreviewShell mode="signup" role={role} inviteToken={inviteToken}>
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading: boolean) => (
            <>
              <SignUp.Step name="start">
                {inviteToken && <div className="mb-4 rounded-[14px] border p-4" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}><p className="text-[14px] font-semibold" style={{ color: COLORS.primaryActive }}>You&apos;ve been invited to join as an artisan!</p><p className="mt-1 text-[14px]" style={{ color: COLORS.body }}>Invite token: {inviteToken} · Artisan role locked after validation.</p></div>}
                <Clerk.Connection name="google" asChild><button disabled={isGlobalLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7] disabled:opacity-60" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}><Clerk.Loading scope="provider:google">{(loading: boolean) => loading ? <Loader2 className="size-4 animate-spin" /> : <><Globe2 size={17} /> Continue with Google</>}</Clerk.Loading></button></Clerk.Connection>
                <Divider />
                <div className="grid gap-3">
                  <Clerk.Field name="emailAddress" className="grid gap-1.5"><Clerk.Label className="text-[14px] font-medium" style={{ color: COLORS.ink }}>Email</Clerk.Label><span className="flex h-14 items-center gap-3 rounded-lg border px-4" style={{ borderColor: COLORS.hairline }}><Mail size={17} style={{ color: COLORS.muted }} /><Clerk.Input type="email" required placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#929292]" /></span><Clerk.FieldError className="text-[12px] text-red-600" /></Clerk.Field>
                  <Clerk.Field name="password" className="grid gap-1.5"><Clerk.Label className="text-[14px] font-medium" style={{ color: COLORS.ink }}>Password</Clerk.Label><span className="flex h-14 items-center gap-3 rounded-lg border px-4" style={{ borderColor: COLORS.hairline }}><LockKeyhole size={17} style={{ color: COLORS.muted }} /><Clerk.Input type="password" required placeholder="Create a password" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#929292]" /></span><Clerk.FieldError className="text-[12px] text-red-600" /></Clerk.Field>
                  <div id="clerk-captcha" className="rounded-lg border px-4 py-3 text-[14px] leading-[1.43]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.muted }}>CAPTCHA placeholder area</div>
                  <SignUp.Action submit asChild><PrimaryButton disabled={isGlobalLoading}><Clerk.Loading>{(loading: boolean) => loading ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : isArtisan ? "Create Artisan Account" : "Create Account"}</Clerk.Loading></PrimaryButton></SignUp.Action>
                </div>
              </SignUp.Step>
              <SignUp.Step name="verifications">
                <SignUp.Strategy name="email_code">
                  <div className="mb-6 grid h-12 w-12 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}><KeyRound size={20} /></div>
                  <h3 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>Check your email</h3>
                  <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>Enter the verification code sent to your email to finish authentication.</p>
                  <Clerk.Field name="code" className="mt-5 grid gap-2"><Clerk.Input type="otp" autoSubmit className="h-12 rounded-lg border text-center text-[18px] font-semibold tracking-[0.4em] outline-none" style={{ borderColor: COLORS.hairline }} /><Clerk.FieldError className="text-[12px] text-red-600" /></Clerk.Field>
                  <SignUp.Action submit asChild><PrimaryButton disabled={isGlobalLoading}>Verify and continue</PrimaryButton></SignUp.Action>
                </SignUp.Strategy>
              </SignUp.Step>
              <p className="mt-5 text-center text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>{isArtisan ? "Not an artisan? " : "Already have an account? "}<Link href={isArtisan ? "/sign-up" : "/sign-in"} className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>{isArtisan ? "Sign up as a client" : "Sign in"}</Link>{!isArtisan && <> <span>·</span> <Link href="/sign-up?role=artisan" className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>Sign up as an artisan</Link></>}</p>
            </>
          )}
        </Clerk.Loading>
      </SignUp.Root>
    </AuthPreviewShell>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="size-8 animate-spin text-emerald-600" /></div>}><SignUpForm /></Suspense>;
}
