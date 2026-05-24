import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn
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
