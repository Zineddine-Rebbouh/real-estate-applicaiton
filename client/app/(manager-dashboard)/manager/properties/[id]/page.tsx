"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/manager/property-form";
import {
  useGetPropertyByIdQuery,
  useUpdatePropertyMutation,
} from "@/state/api";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const { data, isLoading: loadingProperty, error } = useGetPropertyByIdQuery(id, {
    skip: !id,
  });
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();

  const property = data?.property;

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!id) return;
    try {
      await updateProperty({ id, data: formData }).unwrap();
      toast.success("Listing updated successfully!");
      router.push("/manager/properties");
    } catch {
      toast.error("Failed to update listing. Please verify your inputs.");
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center p-12 text-center">
        <h2 className="text-lg font-bold text-foreground">Property Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The requested listing could not be found or you do not have permission to view it.
        </p>
        <Button
          className="mt-4"
          size="sm"
          nativeButton={false}
          render={<Link href="/manager/properties" />}
        >
          Return to Properties
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
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

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/tenant/rentals/${property.id}`} />}
            className="text-xs"
          >
            Preview Public Page
          </Button>
        </div>

        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Edit Property Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update specifications, rental pricing, and amenities for{" "}
            <span className="font-semibold text-foreground">{property.name}</span>.
          </p>
        </header>

        <PropertyForm
          initialData={property}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          isEdit={true}
        />
      </div>
    </main>
  );
}

