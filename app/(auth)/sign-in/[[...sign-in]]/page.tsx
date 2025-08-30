'use client';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Hammer } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { cn } from '@/lib/utils';

export default function SignInPage() {
  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center min-h-svh">
      <SignIn.Root>
        <Clerk.Loading>
          {(isGlobalLoading: boolean) => (
            <div className="w-full sm:w-96">
              <SignIn.Step name="start">
                <Card className="w-full sm:w-96">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hammer className="w-6 h-6 text-blue-600" />
                      Welcome back to ArtisanLink
                    </CardTitle>
                    <CardDescription>
                      Sign in to your ArtisanLink account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-y-4">
                    <div>
                      <Clerk.Connection name="google" asChild>
                        <Button
                          className="w-full"
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={isGlobalLoading}
                        >
                          <Clerk.Loading scope="provider:google">
                            {(isLoading: boolean) =>
                              isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <SiGoogle className="mr-2 size-4" />
                                  Google
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                    </div>
                    <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                      or
                    </p>
                    <Clerk.Field name="identifier" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Email address</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignIn.Action submit asChild>
                        <Button disabled={isGlobalLoading}>
                          <Clerk.Loading>
                            {(isLoading: boolean) => {
                              return isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                'Continue'
                              )
                            }}
                          </Clerk.Loading>
                        </Button>
                      </SignIn.Action>
                      <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?
                        <Button variant="link" size="sm" asChild>
                          <Clerk.Link navigate="sign-up">Sign up</Clerk.Link>
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </SignIn.Step>

              <SignIn.Step name="choose-strategy">
                <Card className="w-full sm:w-96">
                  <CardHeader>
                    <CardTitle>Use another method</CardTitle>
                    <CardDescription>
                      Facing trouble? You can use any of these methods to sign in.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-y-4">
                    <SignIn.SupportedStrategy name="email_code" asChild>
                      <Button type="button" variant="link" disabled={isGlobalLoading}>
                        Email code
                      </Button>
                    </SignIn.SupportedStrategy>
                    <SignIn.SupportedStrategy name="password" asChild>
                      <Button type="button" variant="link" disabled={isGlobalLoading}>
                        Password
                      </Button>
                    </SignIn.SupportedStrategy>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignIn.Action navigate="previous" asChild>
                        <Button disabled={isGlobalLoading}>
                          <Clerk.Loading>
                            {(isLoading: boolean) => {
                              return isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                'Go back'
                              )
                            }}
                          </Clerk.Loading>
                        </Button>
                      </SignIn.Action>
                    </div>
                  </CardFooter>
                </Card>
              </SignIn.Step>

              <SignIn.Step name="verifications">
                <SignIn.Strategy name="password">
                  <Card className="w-full sm:w-96">
                    <CardHeader>
                      <CardTitle>Enter your password</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Welcome back <SignIn.SafeIdentifier />
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-y-4">
                      <Clerk.Field name="password" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label>Password</Label>
                        </Clerk.Label>
                        <Clerk.Input type="password" asChild>
                          <Input />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive" />
                      </Clerk.Field>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <SignIn.Action submit asChild>
                          <Button disabled={isGlobalLoading}>
                            <Clerk.Loading>
                              {(isLoading: boolean) => {
                                return isLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  'Continue'
                                )
                              }}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button type="button" size="sm" variant="link">
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </div>
                    </CardFooter>
                  </Card>
                </SignIn.Strategy>

                <SignIn.Strategy name="email_code">
                  <Card className="w-full sm:w-96">
                    <CardHeader>
                      <CardTitle>Check your email</CardTitle>
                      <CardDescription>
                        Enter the verification code sent to your email address.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-y-4">
                      <div className="grid items-center justify-center gap-y-2">
                        <Clerk.Field name="code" className="space-y-2">
                          <Clerk.Label className="sr-only">Email address</Clerk.Label>
                          <div className="flex justify-center text-center">
                            <Clerk.Input
                              type="otp"
                              className="flex justify-center has-[:disabled]:opacity-50"
                              autoSubmit
                              render={({ value, status }) => {
                                return (
                                  <div className="flex gap-1">
                                    {Array.from({ length: 6 }, (_, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          'relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                                          {
                                            'bg-accent': status === 'cursor' || status === 'selected',
                                          }
                                        )}
                                      >
                                        {value?.[i]}
                                        {status === 'cursor' && (
                                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )
                              }}
                            />
                          </div>
                          <Clerk.FieldError className="block text-center text-sm text-destructive" />
                        </Clerk.Field>
                        <div className="grid items-center justify-center gap-y-2">
                          <SignIn.Action
                            asChild
                            resend
                            className="text-muted-foreground"
                            fallback={({ resendableAfter }: { resendableAfter: number }) => (
                              <Button variant="link" size="sm" disabled>
                                Didn&apos;t receive a code? Resend (
                                <span className="tabular-nums">{resendableAfter}</span>)
                              </Button>
                            )}
                          >
                            <Button type="button" variant="link" size="sm">
                              Didn&apos;t receive a code? Resend
                            </Button>
                          </SignIn.Action>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <SignIn.Action submit asChild>
                          <Button disabled={isGlobalLoading}>
                            <Clerk.Loading>
                              {(isLoading: boolean) => {
                                return isLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  'Continue'
                                )
                              }}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button size="sm" variant="link">
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </div>
                    </CardFooter>
                  </Card>
                </SignIn.Strategy>
              </SignIn.Step>
            </div>
          )}
        </Clerk.Loading>
      </SignIn.Root>
    </div>
  );
}
