"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2Icon,
  DollarSignIcon,
  InfoIcon,
  MapPinIcon,
  SparklesIcon,
  UploadCloudIcon,
} from "lucide-react";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import { propertySchema } from "@/lib/schemas";
import {
  AmenityEnum,
  HighlightEnum,
  PropertyTypeEnum,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/state/api";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function getErrorMsg(err: any): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err.message === "string") return err.message;
  return "Invalid field value";
}

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function PropertyForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [files, setFiles] = React.useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>(
    initialData?.amenities ?? []
  );
  const [selectedHighlights, setSelectedHighlights] = React.useState<string[]>(
    initialData?.highlights ?? []
  );

  // Pre-populate dummy File if editing so zod doesn't fail on photoUrls: File[]
  const defaultPhotoFiles = React.useMemo(() => {
    if (initialData?.photoUrls && initialData.photoUrls.length > 0) {
      return [new File(["dummy"], "existing-photo.jpg", { type: "image/jpeg" })];
    }
    return [];
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      pricePerMonth: initialData?.pricePerMonth ? Number(initialData.pricePerMonth) : ("" as any),
      securityDeposit: initialData?.securityDeposit ? Number(initialData.securityDeposit) : 0,
      applicationFee: initialData?.applicationFee ? Number(initialData.applicationFee) : 50,
      isPetsAllowed: initialData?.isPetsAllowed ?? false,
      isParkingIncluded: initialData?.isParkingIncluded ?? false,
      beds: initialData?.beds ?? 1,
      baths: initialData?.baths ?? 1,
      squareFeet: initialData?.squareFeet ?? 750,
      propertyType: (initialData?.propertyType as PropertyTypeEnum) ?? PropertyTypeEnum.Apartment,
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      country: initialData?.country ?? "United States",
      postalCode: initialData?.postalCode ?? "",
      amenities: initialData?.amenities?.join(",") ?? "WiFi",
      highlights: initialData?.highlights?.join(",") ?? "CloseToTransit",
      photoUrls: defaultPhotoFiles,
    },
  });

  const handleAmenityToggle = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    setValue("amenities", updated.join(","), { shouldValidate: true });
  };

  const handleHighlightToggle = (highlight: string) => {
    const updated = selectedHighlights.includes(highlight)
      ? selectedHighlights.filter((h) => h !== highlight)
      : [...selectedHighlights, highlight];
    setSelectedHighlights(updated);
    setValue("highlights", updated.join(","), { shouldValidate: true });
  };

  const onFormSubmit = async (data: any) => {
    // Stub S3 photos upload: for new properties, stub sample listing images if none uploaded yet
    const photoUrls =
      initialData?.photoUrls && initialData.photoUrls.length > 0
        ? initialData.photoUrls
        : [
            "/singlelisting-1.jpg",
            "/singlelisting-2.jpg",
            "/singlelisting-3.jpg",
          ];

    const payload = {
      name: data.name,
      description: data.description,
      pricePerMonth: data.pricePerMonth,
      securityDeposit: data.securityDeposit,
      applicationFee: data.applicationFee,
      isPetsAllowed: data.isPetsAllowed,
      isParkingIncluded: data.isParkingIncluded,
      beds: data.beds,
      baths: data.baths,
      squareFeet: data.squareFeet,
      propertyType: data.propertyType,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : ["WiFi"],
      highlights: selectedHighlights.length > 0 ? selectedHighlights : ["CloseToTransit"],
      photoUrls,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* S3 Upload Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <InfoIcon className="size-5 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-primary">Media Upload Note</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            FilePond is active for image selection. Direct S3 upload (<code className="rounded bg-muted px-1 py-0.5 text-[11px]">/api/uploads</code>)
            is pending implementation; listings are currently saved with stubbed/verified preview images.
          </p>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <Building2Icon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Property Details</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Listing Title *</Label>
            <Input
              id="name"
              placeholder="e.g. Sunny Downtown Loft with Balcony"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.name)}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Listing Description *</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the unique features, surroundings, and neighborhood..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.description)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="propertyType" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PropertyTypeEnum).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="beds">Beds *</Label>
              <Input
                id="beds"
                type="number"
                min={0}
                max={10}
                {...register("beds")}
              />
              {errors.beds && (
                <p className="text-xs text-destructive">{getErrorMsg(errors.beds)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="baths">Baths *</Label>
              <Input
                id="baths"
                type="number"
                min={0}
                max={10}
                {...register("baths")}
              />
              {errors.baths && (
                <p className="text-xs text-destructive">{getErrorMsg(errors.baths)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Sq Ft *</Label>
              <Input
                id="squareFeet"
                type="number"
                min={50}
                {...register("squareFeet")}
              />
              {errors.squareFeet && (
                <p className="text-xs text-destructive">{getErrorMsg(errors.squareFeet)}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Pricing & Terms */}
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <DollarSignIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Pricing & Terms</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pricePerMonth">Monthly Rent ($) *</Label>
            <Input
              id="pricePerMonth"
              type="number"
              placeholder="2500"
              {...register("pricePerMonth")}
            />
            {errors.pricePerMonth && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.pricePerMonth)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Security Deposit ($) *</Label>
            <Input
              id="securityDeposit"
              type="number"
              placeholder="2500"
              {...register("securityDeposit")}
            />
            {errors.securityDeposit && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.securityDeposit)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationFee">Application Fee ($) *</Label>
            <Input
              id="applicationFee"
              type="number"
              placeholder="50"
              {...register("applicationFee")}
            />
            {errors.applicationFee && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.applicationFee)}</p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Controller
              name="isPetsAllowed"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isPetsAllowed"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isPetsAllowed" className="cursor-pointer">
              Pets Allowed
            </Label>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Controller
              name="isParkingIncluded"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isParkingIncluded"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isParkingIncluded" className="cursor-pointer">
              Parking Included
            </Label>
          </div>
        </div>
      </Card>

      {/* Section 3: Location */}
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <MapPinIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Property Location</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              placeholder="123 Market Street, Apt 4B"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.address)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" placeholder="San Francisco" {...register("city")} />
            {errors.city && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.city)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="state">State / Province *</Label>
              <Input id="state" placeholder="CA" {...register("state")} />
              {errors.state && (
                <p className="text-xs text-destructive">{getErrorMsg(errors.state)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input id="postalCode" placeholder="94103" {...register("postalCode")} />
              {errors.postalCode && (
                <p className="text-xs text-destructive">{getErrorMsg(errors.postalCode)}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" placeholder="United States" {...register("country")} />
            {errors.country && (
              <p className="text-xs text-destructive">{getErrorMsg(errors.country)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Section 4: Amenities & Highlights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <SparklesIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Features & Amenities</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">
              Building & Unit Amenities
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.values(AmenityEnum).map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <div
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center space-x-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={checked}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <span className="text-xs font-medium truncate">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">
              Property Highlights
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.values(HighlightEnum).map((highlight) => {
                const checked = selectedHighlights.includes(highlight);
                return (
                  <div
                    key={highlight}
                    onClick={() => handleHighlightToggle(highlight)}
                    className={`flex items-center space-x-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Checkbox
                      id={`highlight-${highlight}`}
                      checked={checked}
                      onCheckedChange={() => handleHighlightToggle(highlight)}
                    />
                    <span className="text-xs font-medium truncate">{highlight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 5: Photos (FilePond) */}
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <UploadCloudIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Property Photos</h2>
        </div>

        <div className="space-y-4">
          <FilePond
            files={files}
            onupdatefiles={(fileItems) => {
              setFiles(fileItems);
              const extractedFiles = fileItems
                .map((f) => f.file)
                .filter((f) => f instanceof File) as File[];
              if (extractedFiles.length > 0) {
                setValue("photoUrls", extractedFiles, { shouldValidate: true });
              } else if (defaultPhotoFiles.length > 0) {
                setValue("photoUrls", defaultPhotoFiles, { shouldValidate: true });
              }
            }}
            allowMultiple={true}
            maxFiles={10}
            name="photos"
            labelIdle='Drag & Drop property photos or <span class="filepond--label-action">Browse</span>'
          />
          {errors.photoUrls && (
            <p className="text-xs text-destructive">{getErrorMsg(errors.photoUrls)}</p>
          )}

          {initialData?.photoUrls && initialData.photoUrls.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs text-muted-foreground">Current Photos</Label>
              <div className="flex flex-wrap gap-3">
                {initialData.photoUrls.map((url, i) => (
                  <div key={i} className="relative size-20 overflow-hidden rounded-lg border bg-muted">
                    <img src={url} alt={`Listing photo ${i + 1}`} className="size-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Actions Bar */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/manager/properties")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting
            ? isEdit
              ? "Saving Changes…"
              : "Creating Listing…"
            : isEdit
            ? "Update Property"
            : "Publish Listing"}
        </Button>
      </div>
    </form>
  );
}

