import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to pick up where you left off.
        </p>
      </header>

      <AuthForm mode="login" action={login} next={next} />

      <p className="text-center text-sm text-muted-foreground">
        New to Cadence?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
