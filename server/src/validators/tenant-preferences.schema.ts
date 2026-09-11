import { z } from "zod";

// Search-preference onboarding — PATCH /api/tenant/me/preferences.
// Partial PATCH: every field is optional, and each may also be null to clear
// a previously-saved value. Skipping onboarding sends only
// { onboardingCompletedAt: <ISO-8601 string> }.
const budget = z.number().finite().nonnegative().max(999_999.99);
const count = z.number().int().nonnegative().max(50);

export const updateTenantPreferencesSchema = z
  .object({
    minBudget: budget.nullable().optional(),
    maxBudget: budget.nullable().optional(),
    desiredBeds: count.nullable().optional(),
    desiredBaths: count.nullable().optional(),
    householdSize: count.nullable().optional(),
    hasPets: z.boolean().nullable().optional(),
    petType: z.string().trim().max(50).nullable().optional(),
    needsParking: z.boolean().nullable().optional(),
    moveInTimeline: z
      .enum(["ASAP", "Within30Days", "Within90Days", "JustBrowsing"])
      .nullable()
      .optional(),
    preferredCity: z.string().trim().max(100).nullable().optional(),
    onboardingCompletedAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Nothing to update" },
  )
  .refine(
    (value) =>
      value.minBudget == null ||
      value.maxBudget == null ||
      value.minBudget <= value.maxBudget,
    { message: "minBudget must not exceed maxBudget" },
  );