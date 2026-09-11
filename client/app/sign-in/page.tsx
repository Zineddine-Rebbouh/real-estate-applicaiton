"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { BlueprintPanel } from "@/components/auth/blueprint-panel";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGetMeQuery, useLoginMutation } from "@/state/api";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);
  const [login, { error: loginError }] = useLoginMutation();
  const { data: currentUser } = useGetMeQuery();
  const router = useRouter();

  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (currentUser?.user) {
      router.replace(
        currentUser.user.role === "MANAGER"
          ? "/manager/overview"
          : "/tenant/overview",
      );
    }
  }, [currentUser, router]);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    return "";
  };

  const handleBlur = (field: "email" | "password", value: string) => {
    const error =
      field === "email" ? validateEmail(value) : validatePassword(value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });

      // Focus first invalid field
      if (emailError) {
        emailRef.current?.focus();
      } else if (passwordError) {
        passwordRef.current?.focus();
      }

      setIsLoading(false);
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      router.push(
        res.user.role === "MANAGER" ? "/manager/overview" : "/tenant/overview",
      );
    } catch (e: unknown) {
      const status =
        typeof e === "object" && e !== null && "status" in e
          ? (e as { status?: unknown }).status
          : undefined;
      const serverError =
        typeof e === "object" && e !== null && "data" in e
          ? (e as { data?: { error?: string } }).data?.error
          : undefined;
      setErrors({
        form:
          status === 429
            ? (serverError ?? "Too many attempts, please try again later")
            : "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left side - Form */}
      <div
        className={cn(
          "flex min-h-screen flex-1 items-start justify-center overflow-y-auto bg-background px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-8 xl:px-20",
          mounted && "animate-in fade-in slide-in-from-left-4 duration-500",
        )}
      >
        <div className="m-auto w-full max-w-md space-y-5">
          {/* Logo */}
          <div
            className={cn(
              "opacity-100",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-2 duration-500",
            )}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Habitat home"
            >
              <Logo className="h-12" />
            </Link>
          </div>

          {/* Heading */}
          <div
            className={cn(
              "space-y-1.5 opacity-100",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-40",
            )}
          >
            <h1 className="font-display text-2xl font-bold tracking-tight leading-tight sm:text-3xl">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "auth-form space-y-4 opacity-100",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-80",
            )}
          >
            {/* Email field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-foreground"
              >
                Email address
              </Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-10 text-sm"
                onBlur={(e) => handleBlur("email", e.target.value)}
                disabled={isLoading}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </Label>
                <span
                  className="text-sm font-medium text-muted-foreground/60"
                  title="Coming soon"
                >
                  Forgot password?{" "}
                  <span className="text-xs">(Coming soon)</span>
                </span>
              </div>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="h-10 pr-10 text-sm"
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold touch-manipulation"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
            {(errors.form || loginError) && (
              <p className="text-sm text-destructive" role="alert">
                {errors.form || "Unable to sign in. Please try again."}
              </p>
            )}

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Sign up
              </Link>
            </p>
            {/* Demo accounts */}
            <details className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-card-foreground">
              <summary className="cursor-pointer font-semibold">
                Try a demo account
              </summary>
              <p className="mt-2 text-muted-foreground">
                Password for all demo accounts:{" "}
                <code className="rounded bg-muted px-1 font-mono text-foreground">Habitat2026!</code>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (emailRef.current)
                      emailRef.current.value =
                        "aaravpatel.1@example.com";
                    if (passwordRef.current)
                      passwordRef.current.value = "Habitat2026!";
                    setErrors({});
                  }}
                >
                  Fill tenant demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (emailRef.current)
                      emailRef.current.value =
                        "eleanor.vance@habitat-properties.com";
                    if (passwordRef.current)
                      passwordRef.current.value = "Habitat2026!";
                    setErrors({});
                  }}
                >
                  Fill manager demo
                </Button>
              </div>
            </details>
          </form>
        </div>
      </div>

      {/* Right side - Blueprint panel */}
      <BlueprintPanel className="hidden lg:block lg:flex-1" />
    </div>
  );
}
