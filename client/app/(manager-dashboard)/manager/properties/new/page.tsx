"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/manager/property-form";
import { useCreatePropertyMutation } from "@/state/api";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const res = await createProperty(data).unwrap();
      toast.success("Listing created successfully!", {
        description: `${res.property.name} is now live.`,
      });
      router.push("/manager/properties");
    } catch {
      toast.error("Failed to create property listing. Please check required fields.");
    }
  };

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/manager/properties" />}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            <span>Back to Properties</span>
          </Button>
        </div>

        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create Property Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide the rental details, monthly rates, amenities, and location to list your property.
          </p>
        </header>

        <PropertyForm onSubmit={handleCreate} isSubmitting={isLoading} />
      </div>
    </main>
  );
}

