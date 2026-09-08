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
    const inviteCode = (formData.get("inviteCode") as string) || "";

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password,
    );
    const inviteCodeError =
      role === "MANAGER" && !inviteCode.trim()
        ? "Manager signup requires an invite code"
        : "";

    if (nameError || emailError || passwordError || confirmPasswordError || inviteCodeError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        inviteCode: inviteCodeError,
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
      const res = await signup(
        role === "MANAGER"
          ? { name, email, password, role, inviteCode: inviteCode.trim() }
          : { name, email, password, role },
      ).unwrap();
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
            {role === "MANAGER" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="inviteCode"
                  className="text-sm font-semibold text-foreground"
                >
                  Manager invite code
                </Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  autoComplete="off"
                  placeholder="HAB-XXXXXXXX"
                  aria-invalid={!!errors.inviteCode}
                  aria-describedby={
                    errors.inviteCode ? "inviteCode-error" : undefined
                  }
                  className="h-10 text-sm"
                  disabled={isLoading}
                />
                {errors.inviteCode && (
                  <p
                    id="inviteCode-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.inviteCode}
                  </p>
                )}
              </div>
            )}
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
