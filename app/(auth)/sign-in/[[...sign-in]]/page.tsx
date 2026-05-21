'use client';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { Loader2, Mail } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import Link from 'next/link';
import ChapaWorksLogo from '@/components/common/ChapaWorksLogo';

export default function SignInPage() {
  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      {/* Minimal nav */}
      <nav className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <ChapaWorksLogo size={22} />
          <span className="text-lg font-serif font-bold text-emerald-800">ChapaWorks</span>
        </Link>
        <span className="text-sm text-stone-500">
          New here?{' '}
          <Link href="/sign-up" className="text-emerald-700 font-medium hover:underline">Create account</Link>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading: boolean) => (
              <div className="w-full max-w-md">

                <SignIn.Step name="start">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">
                      Welcome back
                    </h1>
                    <p className="text-stone-500 text-sm">Sign in to your ChapaWorks account</p>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
                    {/* Google */}
                    <Clerk.Connection name="google" asChild>
                      <button
                        disabled={isGlobalLoading}
                        className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-60"
                      >
                        <Clerk.Loading scope="provider:google">
                          {(isLoading: boolean) =>
                            isLoading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <SiGoogle className="size-4" />
                                Continue with Google
                              </>
                            )
                          }
                        </Clerk.Loading>
                      </button>
                    </Clerk.Connection>

                    <div className="flex items-center gap-3 my-6">
                      <div className="flex-1 h-px bg-stone-200" />
                      <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">or</span>
                      <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    {/* Email identifier */}
                    <Clerk.Field name="identifier" className="mb-6">
                      <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Email address
                      </Clerk.Label>
                      <Clerk.Input
                        type="email"
                        required
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-stone-400"
                        placeholder="you@example.com"
                      />
                      <Clerk.FieldError className="mt-1 text-xs text-red-600 block" />
                    </Clerk.Field>

                    <SignIn.Action submit asChild>
                      <button
                        disabled={isGlobalLoading}
                        className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <Clerk.Loading>
                          {(isLoading: boolean) =>
                            isLoading ? <><Loader2 className="size-4 animate-spin" /> Signing in…</> : 'Continue'
                          }
                        </Clerk.Loading>
                      </button>
                    </SignIn.Action>
                  </div>

                  <p className="text-center text-sm text-stone-500 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-emerald-700 font-medium hover:underline">Sign up free</Link>
                  </p>
                </SignIn.Step>

                {/* Choose strategy */}
                <SignIn.Step name="choose-strategy">
                  <div className="text-center mb-8">
                    <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">Choose a sign-in method</h1>
                    <p className="text-stone-500 text-sm">Select how you&apos;d like to verify your identity</p>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 space-y-3">
                    <SignIn.SupportedStrategy name="email_code" asChild>
                      <button className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left">
                        Email verification code
                      </button>
                    </SignIn.SupportedStrategy>
                    <SignIn.SupportedStrategy name="password" asChild>
                      <button className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left">
                        Password
                      </button>
                    </SignIn.SupportedStrategy>
                    <SignIn.Action navigate="previous" asChild>
                      <button className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors">
                        ← Go back
                      </button>
                    </SignIn.Action>
                  </div>
                </SignIn.Step>

                {/* Verifications */}
                <SignIn.Step name="verifications">
                  {/* Password strategy */}
                  <SignIn.Strategy name="password">
                    <div className="text-center mb-8">
                      <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">Enter your password</h1>
                      <p className="text-stone-500 text-sm">Welcome back, <SignIn.SafeIdentifier /></p>
                    </div>
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
                      <Clerk.Field name="password" className="mb-6">
                        <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5">Password</Clerk.Label>
                        <Clerk.Input
                          type="password"
                          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-stone-400"
                          placeholder="Your password"
                        />
                        <Clerk.FieldError className="mt-1 text-xs text-red-600 block" />
                      </Clerk.Field>
                      <SignIn.Action submit asChild>
                        <button
                          disabled={isGlobalLoading}
                          className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
                        >
                          <Clerk.Loading>
                            {(isLoading: boolean) =>
                              isLoading ? <><Loader2 className="size-4 animate-spin" /> Signing in…</> : 'Sign In'
                            }
                          </Clerk.Loading>
                        </button>
                      </SignIn.Action>
                      <SignIn.Action navigate="choose-strategy" asChild>
                        <button className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors">
                          Use another method
                        </button>
                      </SignIn.Action>
                    </div>
                  </SignIn.Strategy>

                  {/* Email code strategy */}
                  <SignIn.Strategy name="email_code">
                    <div className="text-center mb-8">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">Check your email</h1>
                      <p className="text-stone-500 text-sm">We sent a 6-digit code to your email address.</p>
                    </div>
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
                      <Clerk.Field name="code" className="mb-6">
                        <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5 text-center">
                          Verification code
                        </Clerk.Label>
                        <Clerk.Input
                          type="otp"
                          autoSubmit
                          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center tracking-widest font-mono"
                          placeholder="000000"
                        />
                        <Clerk.FieldError className="mt-1 text-xs text-red-600 block text-center" />
                      </Clerk.Field>
                      <SignIn.Action submit asChild>
                        <button
                          disabled={isGlobalLoading}
                          className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
                        >
                          <Clerk.Loading>
                            {(isLoading: boolean) =>
                              isLoading ? <><Loader2 className="size-4 animate-spin" /> Verifying…</> : 'Verify & Sign In'
                            }
                          </Clerk.Loading>
                        </button>
                      </SignIn.Action>
                      <div className="text-center">
                        <SignIn.Action
                          resend
                          className="text-stone-400"
                          fallback={({ resendableAfter }: { resendableAfter: number }) => (
                            <span className="text-sm text-stone-400">Resend in {resendableAfter}s</span>
                          )}
                          asChild
                        >
                          <button className="text-sm text-stone-400 hover:text-emerald-700 transition-colors">
                            Resend code
                          </button>
                        </SignIn.Action>
                      </div>
                      <SignIn.Action navigate="choose-strategy" asChild>
                        <button className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors mt-2">
                          Use another method
                        </button>
                      </SignIn.Action>
                    </div>
                  </SignIn.Strategy>
                </SignIn.Step>

              </div>
            )}
          </Clerk.Loading>
        </SignIn.Root>
      </div>
    </div>
  );
}
