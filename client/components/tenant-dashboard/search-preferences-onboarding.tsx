"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FilterState } from "@/src/data/rentals-data";
import {
  type MoveInTimeline,
  type TenantPreferences,
  useGetMeQuery,
  useUpdateTenantPreferencesMutation,
} from "@/state/api";

const TIMELINE_OPTIONS: { value: MoveInTimeline; label: string }[] = [
  { value: "ASAP", label: "As soon as possible" },
  { value: "Within30Days", label: "Within 30 days" },
  { value: "Within90Days", label: "Within 90 days" },
  { value: "JustBrowsing", label: "Just browsing" },
];

const BED_OPTIONS = [
  { value: "0", label: "Studio" },
  { value: "1", label: "1 bed" },
  { value: "2", label: "2 beds" },
  { value: "3", label: "3 beds" },
  { value: "4", label: "4+ beds" },
];

const BATH_OPTIONS = [
  { value: "1", label: "1 bath" },
  { value: "2", label: "2 baths" },
  { value: "3", label: "3+ baths" },
];

const HOUSEHOLD_OPTIONS = [
  { value: "1", label: "1 person" },
  { value: "2", label: "2 people" },
  { value: "3", label: "3 people" },
  { value: "4", label: "4 people" },
  { value: "5", label: "5+ people" },
];

type PreferenceFormState = {
  minBudget: string;
  maxBudget: string;
  moveInTimeline: MoveInTimeline | "";
  desiredBeds: string;
  desiredBaths: string;
  householdSize: string;
  hasPets: boolean;
  petType: string;
  needsParking: boolean;
  preferredCity: string;
};

function initialFormState(): PreferenceFormState {
  return {
    minBudget: "",
    maxBudget: "",
    moveInTimeline: "",
    desiredBeds: "",
    desiredBaths: "",
    householdSize: "",
    hasPets: false,
    petType: "",
    needsParking: false,
    preferredCity: "",
  };
}

// One-time search-preference onboarding popup, centered over /tenant/explore
// (shown right after signup redirects there). A dimmed backdrop focuses the
// card; "Skip for now" is always available and persists onboardingCompletedAt
// so the popup is not re-shown ("skipped = seen"). "Save preferences" records
// the tenant's search criteria AND applies them to the explore filters via
// onApplyPreferences, so the page behind the popup is already personalized
// once it closes.
export function SearchPreferencesOnboarding({
  onApplyPreferences,
}: {
  onApplyPreferences?: (filters: Partial<FilterState>) => void;
}) {
  const { data } = useGetMeQuery();
  const [savePreferences, { isLoading, error: mutationError }] =
    useUpdateTenantPreferencesMutation();
  const [form, setForm] = React.useState<PreferenceFormState>(
    initialFormState,
  );
  const [error, setError] = React.useState("");

  // Keep every hook above the conditional return below — an early return
  // before this effect would change the hook count between renders and crash
  // with "Rendered fewer hooks than expected" (Rules of Hooks).
  React.useEffect(() => {
    if (mutationError) setError("Couldn't save. Please try again.");
  }, [mutationError]);

  const user = data?.user;
  const shouldShow = Boolean(
    !isLoading &&
      user?.role === "TENANT" &&
      user.onboardingCompletedAt == null,
  );
  if (!shouldShow) return null;

  const setField = <K extends keyof PreferenceFormState>(
    key: K,
    value: PreferenceFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = (): Partial<TenantPreferences> => {
    const min = form.minBudget.trim() ? Number(form.minBudget) : null;
    const max = form.maxBudget.trim() ? Number(form.maxBudget) : null;
    return {
      minBudget: min,
      maxBudget: max,
      desiredBeds: form.desiredBeds !== "" ? Number(form.desiredBeds) : null,
      desiredBaths: form.desiredBaths !== "" ? Number(form.desiredBaths) : null,
      householdSize: form.householdSize !== "" ? Number(form.householdSize) : null,
      hasPets: form.hasPets || Boolean(form.petType.trim()),
      petType: form.hasPets && form.petType.trim() ? form.petType.trim() : null,
      needsParking: form.needsParking,
      moveInTimeline: form.moveInTimeline !== "" ? form.moveInTimeline : null,
      preferredCity: form.preferredCity.trim() ? form.preferredCity.trim() : null,
      onboardingCompletedAt: new Date().toISOString(),
    };
  };

  // Maps the completed form onto the explorer's FilterState so saved
  // preferences immediately drive the search results behind the popup.
  const toFilterPatch = (): Partial<FilterState> => {
    const patch: Partial<FilterState> = {};
    const min = form.minBudget.trim() ? Number(form.minBudget) : null;
    const max = form.maxBudget.trim() ? Number(form.maxBudget) : null;
    if (min !== null) patch.minPrice = min;
    if (max !== null) patch.maxPrice = max;
    if (form.desiredBeds !== "") patch.beds = Number(form.desiredBeds);
    if (form.desiredBaths !== "") patch.baths = Number(form.desiredBaths);
    if (form.hasPets) patch.petFriendlyOnly = true;
    if (form.needsParking) patch.parkingOnly = true;
    const city = form.preferredCity.trim();
    if (city) patch.locationQuery = city;
    return patch;
  };

  const handleSave = async () => {
    setError("");
    const min = form.minBudget.trim() ? Number(form.minBudget) : null;
    const max = form.maxBudget.trim() ? Number(form.maxBudget) : null;
    if (min !== null && max !== null && min > max) {
      setError("Minimum budget can't be higher than maximum budget.");
      return;
    }
    try {
      // invalidatesTags: ["Auth"] refetches /api/auth/me, whose
      // onboardingCompletedAt is now set — this card disappears.
      await savePreferences(buildPayload()).unwrap();
      // Push the saved preferences into the explorer's FilterState so the
      // page revealed behind the closing popup already matches them.
      onApplyPreferences?.(toFilterPatch());
    } catch {
      setError("We couldn't save your preferences. Please try again.");
    }
  };

  const handleSkip = async () => {
    setError("");
    try {
      await savePreferences({
        onboardingCompletedAt: new Date().toISOString(),
      }).unwrap();
      // Same Auth-tag invalidation hides the card.
    } catch {
      setError("We couldn't dismiss this step. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Personalize your search"
    >
    <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-base">Personalize your search</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Answer a few quick questions and we&apos;ll pre-fill filters for you.
          You can skip this — it only takes 30 seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pref-min-budget">Monthly budget</Label>
          <div className="flex items-center gap-2">
            <Input
              id="pref-min-budget"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min ($)"
              value={form.minBudget}
              onChange={(e) => setField("minBudget", e.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              aria-label="Maximum monthly budget"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max ($)"
              value={form.maxBudget}
              onChange={(e) => setField("maxBudget", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pref-timeline">Move-in timeline</Label>
          <Select
            id="pref-timeline"
            value={form.moveInTimeline}
            onValueChange={(value) => setField("moveInTimeline", value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {TIMELINE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="pref-beds">Bedrooms</Label>
            <Select value={form.desiredBeds} onValueChange={(value) => setField("desiredBeds", value ?? "")}>
              <SelectTrigger id="pref-beds" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {BED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="pref-baths">Bathrooms</Label>
            <Select value={form.desiredBaths} onValueChange={(value) => setField("desiredBaths", value ?? "")}>
              <SelectTrigger id="pref-baths" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {BATH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="pref-household">Household</Label>
            <Select value={form.householdSize} onValueChange={(value) => setField("householdSize", value ?? "")}>
              <SelectTrigger id="pref-household" className="w-full">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {HOUSEHOLD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pref-city">Preferred city (optional)</Label>
          <Input
            id="pref-city"
            type="text"
            placeholder="e.g. Wrocław"
            value={form.preferredCity}
            onChange={(e) => setField("preferredCity", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="pref-pets">I have pets</Label>
          <Switch
            id="pref-pets"
            checked={form.hasPets}
            onCheckedChange={(value) => setField("hasPets", value)}
          />
        </div>
        {form.hasPets && (
          <Input
            aria-label="Pet type"
            type="text"
            placeholder="Pet type (e.g. dog, cat)"
            value={form.petType}
            onChange={(e) => setField("petType", e.target.value)}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="pref-parking">I need parking</Label>
          <Switch
            id="pref-parking"
            checked={form.needsParking}
            onCheckedChange={(value) => setField("needsParking", value)}
          />
        </div>
      </CardContent>

      {error && (
        <p className="px-3 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <CardFooter className="flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => void handleSkip()}
        >
          Skip for now
        </Button>
        <Button
          size="sm"
          disabled={isLoading}
          onClick={() => void handleSave()}
        >
          {isLoading ? "Saving…" : "Save preferences"}
        </Button>
      </CardFooter>
    </Card>
    </div>
  );
}