"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, AlertCircle, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AuthState } from "@/lib/auth/actions";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

type Props = {
  mode: "login" | "signup";
  action: AuthAction;
  next?: string;
};

export function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isSignup && (
        <Field
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          error={state.fieldErrors?.fullName?.[0]}
        />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder="••••••••"
        error={state.fieldErrors?.password?.[0]}
      />

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <AnimatePresence mode="wait">
        {state.error ? (
          <Banner key="error" tone="error" icon={<AlertCircle className="size-4" />}>
            {state.error}
          </Banner>
        ) : state.message ? (
          <Banner key="message" tone="info" icon={<MailCheck className="size-4" />}>
            {state.message}
          </Banner>
        ) : null}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 w-full text-sm font-medium"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isSignup ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 transition-colors",
          error && "border-destructive focus-visible:ring-destructive/30",
        )}
      />
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "error" | "info";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/20 bg-primary/5 text-foreground",
      )}
    >
      {icon}
      <span>{children}</span>
    </motion.div>
  );
}
