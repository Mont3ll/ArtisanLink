'use client';
import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import Link from 'next/link';
import ChapaWorksLogo from '@/components/common/ChapaWorksLogo';
import { Mail } from 'lucide-react';

const ROLE_COOKIE_NAME = 'chapaworks_signup_role';

/**
 * Inner component that safely reads searchParams inside Suspense boundary.
 * This prevents the SSR race condition where useSearchParams() returns null
 * on initial render and the cookie gets set to 'client' before hydration.
 */
function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  // Role comes from URL only — no in-page role selector
  const urlRole = searchParams.get('role') === 'artisan' ? 'artisan' : 'client';

  const setRoleCookie = useCallback((selectedRole: string) => {
    document.cookie = `${ROLE_COOKIE_NAME}=${selectedRole}; path=/; max-age=3600; SameSite=Lax`;
  }, []);

  // Store invite token in cookie so /after-sign-up can validate it server-side
  const setInviteCookie = useCallback((token: string) => {
    document.cookie = `chapaworks_invite_token=${token}; path=/; max-age=3600; SameSite=Lax`;
  }, []);

  // Set role cookie immediately on mount from URL param
  useEffect(() => {
    setRoleCookie(urlRole);
  }, [urlRole, setRoleCookie]);

  // Validate invite token — double-check artisan role + store token in cookie
  useEffect(() => {
    if (!inviteToken) return;
    // Store invite token cookie for server-side validation in /after-sign-up
    setInviteCookie(inviteToken);
    fetch(`/api/admin/invites/${inviteToken}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setRoleCookie('artisan');
        }
      })
      .catch(() => {});
  }, [inviteToken, setRoleCookie, setInviteCookie]);

  const isArtisan = urlRole === 'artisan';
  const roleLabel = isArtisan ? 'artisan' : 'client';
  const headline = isArtisan ? 'Join as an Artisan' : 'Create Your Account';
  const subheadline = isArtisan
    ? 'Showcase your skills, get discovered by clients across Kenya.'
    : 'Find and hire verified artisans near you.';

  // Pass role + invite token in the afterSignUpUrl so /after-sign-up can
  // read it from the URL even if the cookie had a race condition.
  // Note: afterSignUpUrl is not supported in @clerk/elements SignUp.Root,
  // so we rely on the Suspense-fixed cookie + invite token cookie as defense-in-depth.

  return (
    <SignUp.Root>
      <Clerk.Loading>
        {(isGlobalLoading: boolean) => (
          <div className="w-full max-w-md">
            <SignUp.Step name="start">
              {/* Role badge */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
                  isArtisan ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  
                  Signing up as {roleLabel}
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">{headline}</h1>
                <p className="text-stone-500 text-sm">{subheadline}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
                {/* Invite Banner */}
                {inviteToken && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 mb-6 flex items-start gap-2">
                    <Mail className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      You&apos;ve been invited to join as an artisan!
                    </p>
                  </div>
                )}

                {/* Google OAuth */}
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
                          <><SiGoogle className="size-4" /> Continue with Google</>
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

                <Clerk.Field name="emailAddress" className="mb-4">
                  <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</Clerk.Label>
                  <Clerk.Input
                    type="email"
                    required
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-stone-400"
                    placeholder="you@example.com"
                  />
                  <Clerk.FieldError className="mt-1 text-xs text-red-600 block" />
                </Clerk.Field>

                <Clerk.Field name="password" className="mb-6">
                  <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5">Password</Clerk.Label>
                  <Clerk.Input
                    type="password"
                    required
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-stone-400"
                    placeholder="Create a strong password"
                  />
                  <Clerk.FieldError className="mt-1 text-xs text-red-600 block" />
                </Clerk.Field>

                <div id="clerk-captcha" className="mb-4" />

                <SignUp.Action submit asChild>
                  <button
                    disabled={isGlobalLoading}
                    className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Clerk.Loading>
                      {(isLoading: boolean) =>
                        isLoading ? (
                          <><Loader2 className="size-4 animate-spin" /> Creating account…</>
                        ) : (
                          `Create ${isArtisan ? 'Artisan' : ''} Account`
                        )
                      }
                    </Clerk.Loading>
                  </button>
                </SignUp.Action>

                <p className="text-center text-xs text-stone-400 mt-4">
                  By signing up you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-stone-600">Terms</Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-stone-600">Privacy Policy</Link>.
                </p>
              </div>

              <p className="text-center text-sm text-stone-500 mt-6">
                {isArtisan ? (
                  <>Looking to hire?{' '}
                    <Link href="/sign-up" className="text-emerald-700 font-medium hover:underline">Sign up as a client</Link>
                  </>
                ) : (
                  <>Are you an artisan?{' '}
                    <Link href="/sign-up?role=artisan" className="text-emerald-700 font-medium hover:underline">Sign up as an artisan</Link>
                  </>
                )}
              </p>
            </SignUp.Step>

            <SignUp.Step name="verifications">
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 max-w-md w-full mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Check your email</h2>
                  <p className="text-sm text-stone-500">We sent a verification code to your email address.</p>
                </div>

                <SignUp.Strategy name="email_code">
                  <Clerk.Field name="code" className="mb-6">
                    <Clerk.Label className="block text-sm font-medium text-stone-700 mb-1.5 text-center">Verification code</Clerk.Label>
                    <Clerk.Input
                      type="otp"
                      autoSubmit
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center tracking-widest font-mono"
                      placeholder="000000"
                    />
                    <Clerk.FieldError className="mt-1 text-xs text-red-600 block text-center" />
                  </Clerk.Field>

                  <SignUp.Action submit asChild>
                    <button
                      disabled={isGlobalLoading}
                      className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Clerk.Loading>
                        {(isLoading: boolean) =>
                          isLoading
                            ? <><Loader2 className="size-4 animate-spin" /> Verifying…</>
                            : 'Verify email'
                        }
                      </Clerk.Loading>
                    </button>
                  </SignUp.Action>
                </SignUp.Strategy>
              </div>
            </SignUp.Step>
          </div>
        )}
      </Clerk.Loading>
    </SignUp.Root>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      {/* Minimal nav */}
      <nav className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <ChapaWorksLogo size={22} />
          <span className="text-lg font-serif font-bold text-emerald-800">ChapaWorks</span>
        </Link>
        <span className="text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-emerald-700 font-medium hover:underline">Sign in</Link>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {/* Suspense boundary ensures useSearchParams() resolves before rendering
            the form — eliminates the SSR race condition with the role cookie */}
        <Suspense fallback={
          <div className="w-full max-w-md flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
          </div>
        }>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
