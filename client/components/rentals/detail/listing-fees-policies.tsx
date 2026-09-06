"use client";

import { useState } from "react";
import {
  CreditCardIcon,
  DogIcon,
  CarIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";
import { FeeItem } from "@/src/data/rental-details-data";

interface FeesPoliciesProps {
  feesBreakdown: {
    requiredFees: FeeItem[];
    petFees: FeeItem[];
    parkingFees: FeeItem[];
  };
  policies: {
    petPolicy: {
      allowed: boolean;
      summary: string;
      rules: string[];
    };
    parkingPolicy: {
      included: boolean;
      type: string;
      summary: string;
      rules: string[];
    };
  };
}

type TabType = "required" | "pets" | "parking";

export function ListingFeesPolicies({
  feesBreakdown,
  policies,
}: FeesPoliciesProps) {
  const [activeTab, setActiveTab] = useState<TabType>("required");

  return (
    <div className="space-y-4 pt-6 border-t border-border/80">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Fees & Policies
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Transparent financial breakdown with no hidden move-in surprises
        </p>
      </div>

      {/* Tabs list with 44x44px touch targets */}
      <div className="flex border-b border-border/70 overflow-x-auto scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("required")}
          className={`flex min-h-[44px] items-center gap-2 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "required"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCardIcon className="size-4" />
          <span>Required Fees ({feesBreakdown.requiredFees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pets")}
          className={`flex min-h-[44px] items-center gap-2 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "pets"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DogIcon className="size-4" />
          <span>Pet Policies ({policies.petPolicy.allowed ? "Allowed" : "No Pets"})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("parking")}
          className={`flex min-h-[44px] items-center gap-2 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "parking"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CarIcon className="size-4" />
          <span>Parking ({policies.parkingPolicy.included ? "Included" : "Optional"})</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="transition-opacity duration-200 animate-in fade-in">
        {activeTab === "required" && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Fee Item & Scope</th>
                    <th className="py-3 px-4 text-right">Amount & Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                  {feesBreakdown.requiredFees.map((fee, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {fee.name}
                        </div>
                        {fee.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 max-w-md">
                            {fee.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                        <span className="font-bold text-foreground">
                          {fee.amount}
                        </span>
                        {fee.frequency && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {fee.frequency}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <InfoIcon className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                All lease agreements are executed via digital signature with an insured escrow guarantee. No key handover charges or unlisted move-in fees.
              </span>
            </div>
          </div>
        )}

        {activeTab === "pets" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                {policies.petPolicy.allowed ? (
                  <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircleIcon className="size-5 text-amber-500" />
                )}
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {policies.petPolicy.allowed
                    ? "Pets are Welcome in this Residence"
                    : "No Pets Allowed"}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {policies.petPolicy.summary}
              </p>

              <div className="mt-4 pt-4 border-t border-border/60">
                <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Pet Guidelines & Requirements
                </h5>
                <ul className="space-y-1.5">
                  {policies.petPolicy.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {policies.petPolicy.allowed && (
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                      <th className="py-3 px-4">Fee Item</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                    {feesBreakdown.petFees.map((fee, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">
                            {fee.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {fee.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                          <span className="font-bold text-foreground">
                            {fee.amount}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {fee.frequency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "parking" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <CarIcon className="size-5 text-primary" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {policies.parkingPolicy.type}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {policies.parkingPolicy.summary}
              </p>

              <div className="mt-4 pt-4 border-t border-border/60">
                <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Garage Specifications
                </h5>
                <ul className="space-y-1.5">
                  {policies.parkingPolicy.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Parking Option</th>
                    <th className="py-3 px-4 text-right">Fee Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                  {feesBreakdown.parkingFees.map((fee, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">
                          {fee.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {fee.description}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                        <span className="font-bold text-foreground">
                          {fee.amount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {fee.frequency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

