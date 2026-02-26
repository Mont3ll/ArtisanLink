'use client';
import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { useState, useEffect, useCallback } from 'react';
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
import { cn } from '@/lib/utils';
import { Loader2, Hammer, Users } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

const ROLE_COOKIE_NAME = 'artisanlink_signup_role';

export default function SignUpPage() {
  const [role, setRole] = useState('client');

  const setRoleCookie = useCallback((selectedRole: string) => {
    document.cookie = `${ROLE_COOKIE_NAME}=${selectedRole}; path=/; max-age=3600; SameSite=Lax`;
  }, []);

  // Set the default cookie on mount
  useEffect(() => {
    setRoleCookie('client');
  }, [setRoleCookie]);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setRoleCookie(selectedRole);
  };

  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center min-h-svh">
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading: boolean) => (
            <div className="w-full sm:w-96">
              <SignUp.Step name="start">
                <Card className="w-full sm:w-96">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hammer className="w-6 h-6 text-emerald-700" />
                      Join ArtisanLink
                    </CardTitle>
                    <CardDescription>
                      Connect with skilled artisans across Kenya
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-y-4">
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>I want to join as:</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          type="button"
                          variant={role === 'client' ? 'default' : 'outline'}
                          className={cn(
                            'h-auto p-4 justify-start text-left',
                            role === 'client' && 'bg-emerald-700 hover:bg-emerald-800'
                          )}
                          onClick={() => handleRoleSelect('client')}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Client</div>
                              <div className="text-sm opacity-80">Find and hire skilled artisans</div>
                            </div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={role === 'artisan' ? 'default' : 'outline'}
                          className={cn(
                            'h-auto p-4 justify-start text-left',
                            role === 'artisan' && 'bg-emerald-700 hover:bg-emerald-800'
                          )}
                          onClick={() => handleRoleSelect('artisan')}
                        >
                          <div className="flex items-center gap-3">
                            <Hammer className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Artisan</div>
                              <div className="text-sm opacity-80">Showcase your skills and get hired</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
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
                    <Clerk.Field name="emailAddress" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Email address</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                    <Clerk.Field name="password" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Password</Label>
                      </Clerk.Label>
                      <Clerk.Input type="password" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignUp.Action submit asChild>
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
                      </SignUp.Action>
                      <div className="text-center text-sm text-muted-foreground">
                        Already have an account?
                        <Button variant="link" size="sm" asChild>
                          <Clerk.Link navigate="sign-in">Sign in</Clerk.Link>
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="continue">
                <Card className="w-full sm:w-96">
                  <CardHeader>
                    <CardTitle>Continue registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Clerk.Field name="username" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Username</Label>
                      </Clerk.Label>
                      <Clerk.Input type="text" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignUp.Action submit asChild>
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
                      </SignUp.Action>
                    </div>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="verifications">
                <SignUp.Strategy name="email_code">
                  <Card className="w-full sm:w-96">
                    <CardHeader>
                      <CardTitle>Verify your email</CardTitle>
                      <CardDescription>
                        Use the verification code sent to your email address
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
                                  <div
                                    className={cn(
                                      'relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                                      {
                                        'bg-accent': status === 'cursor' || status === 'selected',
                                      }
                                    )}
                                  >
                                    {value}
                                    {status === 'cursor' && (
                                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
                                      </div>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          </div>
                          <Clerk.FieldError className="block text-center text-sm text-destructive" />
                        </Clerk.Field>
                        <SignUp.Action
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
                        </SignUp.Action>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <SignUp.Action submit asChild>
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
                        </SignUp.Action>
                        <SignUp.Action navigate="start" asChild>
                          <Button size="sm" variant="link">
                            Use another method
                          </Button>
                        </SignUp.Action>
                      </div>
                    </CardFooter>
                  </Card>
                </SignUp.Strategy>
              </SignUp.Step>
            </div>
          )}
        </Clerk.Loading>
      </SignUp.Root>
    </div>
  );
}
