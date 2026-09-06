"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { BlueprintPanel } from "@/components/auth/blueprint-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGetMeQuery, useSignupMutation } from "@/state/api";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [role, setRole] = React.useState<"TENANT" | "MANAGER">("TENANT");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);
  const [signup, { error: signupError }] = useSignupMutation();
  const { data: currentUser } = useGetMeQuery();
  const router = useRouter();

  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

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

  const validateName = (name: string) => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain uppercase, lowercase, and number";
    }
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const handleBlur = (
    field: "name" | "email" | "password" | "confirmPassword",
    value: string,
    passwordValue?: string,
  ) => {
    let error = "";
    switch (field) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, passwordValue || "");
        break;
    }
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password,
    );

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });

      // Focus first invalid field
      if (nameError) {
        nameRef.current?.focus();
      } else if (emailError) {
        emailRef.current?.focus();
      } else if (passwordError) {
        passwordRef.current?.focus();
      } else if (confirmPasswordError) {
        confirmPasswordRef.current?.focus();
      }

      setIsLoading(false);
      return;
    }

    try {
      const res = await signup({ name, email, password, role }).unwrap();
      router.push(
        res.user.role === "MANAGER" ? "/manager/overview" : "/tenant/overview",
      );
    } catch {
      setErrors({ form: "Unable to create your account. Please try again." });
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
              className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
            >
              Habitat
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
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Get started with your property management journey
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
            {/* Name field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-foreground"
              >
                Full name
              </Label>
              <Input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="h-10 text-sm"
                onBlur={(e) => handleBlur("name", e.target.value)}
                disabled={isLoading}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

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

            {/* Role selection */}
            <div className="space-y-1.5">
              <Label
                htmlFor="role"
                className="text-sm font-semibold text-foreground"
              >
                Choose role
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="TENANT"
                    checked={role === "TENANT"}
                    onChange={() => setRole("TENANT")}
                  />
                  Tenant
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="MANAGER"
                    checked={role === "MANAGER"}
                    onChange={() => setRole("MANAGER")}
                  />
                  Manager
                </label>
              </div>
            </div>
            {/* Password field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-foreground"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                  className="h-10 pr-10 text-sm"
                  onBlur={(e) => {
                    const password = passwordRef.current?.value || "";
                    handleBlur("confirmPassword", e.target.value, password);
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.confirmPassword}
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
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
            {(errors.form || signupError) && (
              <p className="text-sm text-destructive" role="alert">
                {errors.form ||
                  "Unable to create your account. Please try again."}
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
              className="w-full h-10 text-sm font-medium touch-manipulation"
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

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </p>

            {/* Terms */}
            <p className="text-sm text-center text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Privacy Policy
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
