"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { BlueprintPanel } from "@/components/auth/blueprint-panel";
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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReducedMotion) {
      setMounted(true);
    } else {
      setMounted(true);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      router.replace("/");
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
      await login({ email, password }).unwrap();
      router.push("/");
    } catch {
      setErrors({ form: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div
        className={cn(
          "flex-1 flex items-center justify-center p-8 bg-background",
          mounted && "animate-in fade-in slide-in-from-left-4 duration-500",
        )}
      >
        <div className="w-full max-w-md space-y-8">
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
              className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
            >
              <Image
                src="/logo.svg"
                alt="RealEstate"
                width={32}
                height={32}
                className="h-8 w-8 brightness-0"
              />
              <span className="text-foreground">RealEstate</span>
            </Link>
          </div>

          {/* Heading */}
          <div
            className={cn(
              "space-y-4 opacity-100",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-40",
            )}
          >
            <h1 className="font-display text-4xl font-bold tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "auth-form space-y-6 opacity-100",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-80",
            )}
          >
            {/* Email field */}
            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-base font-semibold text-foreground"
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
                className="h-12 text-base"
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
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-base font-semibold text-foreground"
                >
                  Password
                </Label>
                <span
                  className="text-base font-medium text-muted-foreground/60"
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
                  className="h-12 text-base pr-10"
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors touch-manipulation"
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
              className="w-full h-12 text-base font-semibold touch-manipulation"
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs font-medium tracking-wider uppercase">
                <span className="bg-background px-3 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium touch-manipulation"
              disabled={isLoading}
              size="lg"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Sign up link */}
            <p className="text-center text-base text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-base text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Blueprint panel */}
      <BlueprintPanel className="hidden lg:block lg:flex-1" />
    </div>
  );
}
