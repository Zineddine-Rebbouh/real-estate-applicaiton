"use client";

import { useGetMeQuery } from "@/state/api";
import { Loader2Icon } from "lucide-react";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon
          className="size-6 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Checking session</span>
      </div>
    );
  }

  return children;
}
