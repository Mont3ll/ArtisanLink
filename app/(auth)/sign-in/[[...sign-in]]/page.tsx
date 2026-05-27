"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Link from "next/link";
import { Globe2, KeyRound, Loader2, Mail, LockKeyhole } from "lucide-react";

import { AuthPreviewShell } from "@/components/auth/auth-preview-shell";
import { COLORS } from "@/lib/design-tokens";

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[13px]" style={{ color: COLORS.muted }}>
      <span className="h-px flex-1" style={{ background: COLORS.hairlineSoft }} />
      or
      <span className="h-px flex-1" style={{ background: COLORS.hairlineSoft }} />
    </div>
  );
}

function PrimaryButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return <button disabled={disabled} className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60" style={{ background: COLORS.primary }}>{children}</button>;
}

export default function SignInPage() {
  return (
    <AuthPreviewShell mode="signin">
      <SignIn.Root>
        <Clerk.Loading>
          {(isGlobalLoading: boolean) => (
            <>
              <SignIn.Step name="start">
                <Clerk.Connection name="google" asChild>
                  <button disabled={isGlobalLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7] disabled:opacity-60" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
                    <Clerk.Loading scope="provider:google">{(loading: boolean) => loading ? <Loader2 className="size-4 animate-spin" /> : <><Globe2 size={17} /> Continue with Google</>}</Clerk.Loading>
                  </button>
                </Clerk.Connection>
                <Divider />
                <Clerk.Field name="identifier" className="grid gap-1.5">
                  <Clerk.Label className="text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.ink }}>Email</Clerk.Label>
                  <span className="flex h-14 items-center gap-3 rounded-lg border px-4" style={{ borderColor: COLORS.hairline }}>
                    <Mail size={17} style={{ color: COLORS.muted }} />
                    <Clerk.Input type="email" required placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#929292]" />
                  </span>
                  <Clerk.FieldError className="text-[12px] text-red-600" />
                </Clerk.Field>
                <div className="mt-3 rounded-lg border px-4 py-3 text-[14px] leading-[1.43]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.muted }}>CAPTCHA placeholder area</div>
                <SignIn.Action submit asChild><PrimaryButton disabled={isGlobalLoading}><Clerk.Loading>{(loading: boolean) => loading ? <><Loader2 className="size-4 animate-spin" /> Continuing…</> : "Continue"}</Clerk.Loading></PrimaryButton></SignIn.Action>
              </SignIn.Step>

              <SignIn.Step name="choose-strategy">
                <div className="grid gap-3">
                  <SignIn.SupportedStrategy name="email_code" asChild><button className="h-12 rounded-lg border px-4 text-left text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Email verification code</button></SignIn.SupportedStrategy>
                  <SignIn.SupportedStrategy name="password" asChild><button className="h-12 rounded-lg border px-4 text-left text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Password</button></SignIn.SupportedStrategy>
                  <SignIn.Action navigate="previous" asChild><button className="text-[14px]" style={{ color: COLORS.muted }}>Back to form</button></SignIn.Action>
                </div>
              </SignIn.Step>

              <SignIn.Step name="verifications">
                <SignIn.Strategy name="password">
                  <Clerk.Field name="password" className="grid gap-1.5">
                    <Clerk.Label className="text-[14px] font-medium" style={{ color: COLORS.ink }}>Password</Clerk.Label>
                    <span className="flex h-14 items-center gap-3 rounded-lg border px-4" style={{ borderColor: COLORS.hairline }}><LockKeyhole size={17} style={{ color: COLORS.muted }} /><Clerk.Input type="password" placeholder="Your password" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none" /></span>
                    <Clerk.FieldError className="text-[12px] text-red-600" />
                  </Clerk.Field>
                  <SignIn.Action submit asChild><PrimaryButton disabled={isGlobalLoading}>Sign in</PrimaryButton></SignIn.Action>
                </SignIn.Strategy>
                <SignIn.Strategy name="email_code">
                  <div className="mb-6 grid h-12 w-12 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}><KeyRound size={20} /></div>
                  <h3 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>Check your email</h3>
                  <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>Enter the verification code sent to your email to finish authentication.</p>
                  <Clerk.Field name="code" className="mt-5 grid gap-2">
                    <Clerk.Input type="otp" autoSubmit className="h-12 rounded-lg border text-center text-[18px] font-semibold tracking-[0.4em] outline-none" style={{ borderColor: COLORS.hairline }} />
                    <Clerk.FieldError className="text-[12px] text-red-600" />
                  </Clerk.Field>
                  <SignIn.Action submit asChild><PrimaryButton disabled={isGlobalLoading}>Verify and continue</PrimaryButton></SignIn.Action>
                </SignIn.Strategy>
              </SignIn.Step>
              <p className="mt-5 text-center text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>New here? <Link href="/sign-up" className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>Create account</Link></p>
            </>
          )}
        </Clerk.Loading>
      </SignIn.Root>
    </AuthPreviewShell>
  );
}
