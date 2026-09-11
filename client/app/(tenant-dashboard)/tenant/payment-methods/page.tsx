"use client";

import { useState } from "react";
import {
  AlertCircleIcon,
  Building2Icon,
  CheckCircle2Icon,
  CreditCardIcon,
  LockKeyholeIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WalletCardsIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useAddPaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useGetTenantPaymentsQuery,
  useRemovePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  type PaymentMethod as SavedMethod,
} from "@/state/api";

type UiMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
  isBank: boolean;
};

function toUiMethod(m: SavedMethod): UiMethod {
  const isBank = m.type === "Bank";
  return {
    id: m.id,
    brand: m.brand ?? (isBank ? "Bank" : "Card"),
    last4: m.last4,
    expiry: isBank
      ? "Verified"
      : m.expMonth && m.expYear
        ? `${String(m.expMonth).padStart(2, "0")}/${String(m.expYear).slice(-2)}`
        : "—",
    holder: m.accountHolder,
    isDefault: m.isDefault,
    isBank,
  };
}

function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[0-1]|720))/.test(digits)) return "Mastercard";
  return "Card";
}

function parseExpiry(raw: string): { month: number; year: number } | null {
  const m = raw.replace(/\s/g, "").match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

function BrandMark({ brand }: { brand: string }) {
  const isBank = brand === "Bank";
  return (
    <div
      className={`flex size-11 items-center justify-center rounded-lg text-xs font-bold ${brand === "Visa" ? "bg-blue-600 text-white" : brand === "Mastercard" ? "bg-slate-900 text-white" : isBank ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}
    >
      {isBank ? <Building2Icon className="size-5" /> : brand}
    </div>
  );
}

export default function PaymentMethodsPage() {
  const { data, isLoading, isError, refetch } = useGetPaymentMethodsQuery();
  const { data: paymentsData } = useGetTenantPaymentsQuery();
  const [addPaymentMethod] = useAddPaymentMethodMutation();
  const [updatePaymentMethod] = useUpdatePaymentMethodMutation();
  const [removePaymentMethod] = useRemovePaymentMethodMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<UiMethod | null>(null);
  const [removing, setRemoving] = useState<UiMethod | null>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");

  const methods = (data?.paymentMethods ?? []).map(toUiMethod);
  const defaultMethod = methods.find((m) => m.isDefault) ?? null;
  const overdueCount = (paymentsData?.payments ?? []).filter(
    (p) => p.paymentStatus === "Overdue",
  ).length;

  // Only references (brand/last4/expiry/holder) ever leave the browser —
  // full numbers, CVCs, and IBANs are derived locally and discarded.
  const addMethod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const holder = ((form.get("holder") as string) || "").trim();
    if (!holder) return;

    try {
      if (methodType === "card") {
        const digits = ((form.get("number") as string) || "").replace(
          /\D/g,
          "",
        );
        const parsed = parseExpiry((form.get("expiry") as string) || "");
        if (digits.length < 12 || !parsed) {
          toast.error("Enter a valid card number and expiry (MM / YY).");
          return;
        }
        await addPaymentMethod({
          type: "Card",
          brand: detectBrand(digits),
          last4: digits.slice(-4),
          expMonth: parsed.month,
          expYear: parsed.year,
          accountHolder: holder,
        }).unwrap();
      } else {
        const digits = ((form.get("iban") as string) || "").replace(/\D/g, "");
        if (digits.length < 4) {
          toast.error("Enter a valid IBAN.");
          return;
        }
        await addPaymentMethod({
          type: "Bank",
          brand: "Bank",
          last4: digits.slice(-4),
          accountHolder: holder,
        }).unwrap();
      }
      setAddOpen(false);
      toast.success("Payment method added", {
        description: "Your payment details are encrypted and ready to use.",
      });
    } catch {
      toast.error("Couldn't save this payment method. Please try again.");
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await updatePaymentMethod({ id, data: { isDefault: true } }).unwrap();
      toast.success("Default payment method updated");
    } catch {
      toast.error("Couldn't update the default method.");
    }
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const accountHolder = ((form.get("edit-holder") as string) || "").trim();
    const expiryRaw = ((form.get("edit-expiry") as string) || "").trim();
    try {
      if (!editing.isBank) {
        const parsed = parseExpiry(expiryRaw);
        if (!accountHolder || !parsed) {
          toast.error("Enter a valid holder name and expiry (MM / YY).");
          return;
        }
        await updatePaymentMethod({
          id: editing.id,
          data: { accountHolder, expMonth: parsed.month, expYear: parsed.year },
        }).unwrap();
      } else {
        if (!accountHolder) return;
        await updatePaymentMethod({
          id: editing.id,
          data: { accountHolder },
        }).unwrap();
      }
      setEditing(null);
      toast.success("Payment method updated");
    } catch {
      toast.error("Couldn't save your changes. Please try again.");
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removePaymentMethod(removing.id).unwrap();
      setRemoving(null);
      toast.success("Payment method removed");
    } catch {
      toast.error("Couldn't remove this payment method.");
    }
  };

  return (
    <main className="min-h-full bg-muted/30 dark:bg-sidebar">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Payment Methods
              </h1>
              <Badge variant="outline" className="gap-1 text-xs">
                <ShieldCheckIcon className="size-3.5 text-emerald-600" />
                Secure
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the cards and bank accounts you use for rent.
            </p>
          </div>
          {/* <Button
            className="min-h-11 gap-2 self-start sm:self-auto"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="size-4" />
            Add payment method
          </Button> */}
        </header>

        {overdueCount > 0 && (
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-700">
                <AlertCircleIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {overdueCount === 1
                    ? "One payment is overdue"
                    : `${overdueCount} payments are overdue`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your default method to avoid further late payments.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="min-h-11 shrink-0 border-rose-500/30 text-rose-700 hover:bg-rose-500/10"
              onClick={() =>
                defaultMethod ? setEditing(defaultMethod) : setAddOpen(true)
              }
            >
              Update payment method
            </Button>
          </div>
        )}

        <section
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
          aria-label="Saved payment methods"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Saved methods</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {methods.length} methods on file
                </p>
              </div>
              {/* <Button
                variant="outline"
                className="min-h-11 gap-2"
                onClick={() => setAddOpen(true)}
              >
                <PlusIcon className="size-4" />
                Add new
              </Button> */}
            </div>
            {isLoading ? (
              <>
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-xl" />
              </>
            ) : isError ? (
              <Card className="flex flex-col items-center p-10 text-center">
                <WalletCardsIcon className="size-8 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">
                  Couldn&apos;t load your payment methods
                </h3>
                <Button
                  variant="outline"
                  className="mt-5 min-h-11"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </Card>
            ) : (
              methods.map((method) => (
                <Card key={method.id} className="p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <BrandMark brand={method.brand} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {method.brand === "Bank"
                              ? "Bank account"
                              : `${method.brand} ending in ${method.last4}`}
                          </p>
                          {method.isDefault && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {method.holder} ·{" "}
                          {method.isBank
                            ? method.expiry
                            : `Expires ${method.expiry}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={`Edit ${method.brand} ending in ${method.last4}`}
                        onClick={() => setEditing(method)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${method.brand} ending in ${method.last4}`}
                        onClick={() => setRemoving(method)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      {method.isBank
                        ? "Verified for ACH debits"
                        : "Verified for rent payments"}
                    </p>
                    {!method.isDefault && (
                      <Button
                        variant="link"
                        className="min-h-11 justify-start px-0 text-sm"
                        onClick={() => makeDefault(method.id)}
                      >
                        Make default
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
            {!isLoading && !isError && methods.length === 0 && (
              <Card className="flex flex-col items-center p-10 text-center">
                <WalletCardsIcon className="size-8 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">No payment methods yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Add a card or bank account to make rent payments faster.
                </p>
                <Button
                  className="mt-5 min-h-11"
                  onClick={() => setAddOpen(true)}
                >
                  Add payment method
                </Button>
              </Card>
            )}
          </div>
          <Card className="h-fit p-5">
            <div className="flex items-center gap-2">
              <LockKeyholeIcon className="size-5 text-emerald-700" />
              <h2 className="font-semibold">Built for secure payments</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your full card number is never stored on Habitat. Payment details
              are encrypted in transit and handled by PCI DSS-compliant
              providers.
            </p>
            <div className="mt-4 flex items-center gap-2 border-t pt-4 text-xs font-medium text-emerald-700">
              <CheckCircle2Icon className="size-4" />
              PCI DSS compliant
            </div>
          </Card>
        </section>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add payment method</DialogTitle>
              <DialogDescription>
                Choose how you would like to pay rent. Your details are
                encrypted.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethodType("card")}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 ${methodType === "card" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}
              >
                <CreditCardIcon className="size-4" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setMethodType("bank")}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 ${methodType === "bank" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}
              >
                <Building2Icon className="size-4" />
                Bank / SEPA
              </button>
            </div>
            <form onSubmit={addMethod} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="holder">Account holder name</Label>
                <Input
                  id="holder"
                  name="holder"
                  placeholder="Alex Morgan"
                  required
                  className="min-h-11"
                />
              </div>
              {methodType === "card" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="number">Card number</Label>
                    <Input
                      id="number"
                      name="number"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      required
                      className="min-h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        placeholder="MM / YY"
                        required
                        className="min-h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        inputMode="numeric"
                        placeholder="123"
                        required
                        className="min-h-11"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    name="iban"
                    placeholder="DE89 3704 0044 0532 0130 00"
                    required
                    className="min-h-11"
                  />
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Only the last 4 digits leave your browser — full numbers are
                never stored.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="min-h-11">
                  Save method
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update payment method</DialogTitle>
              <DialogDescription>
                Update the holder name
                {editing && !editing.isBank ? " or expiry " : " "}
                for {editing?.brand} ending in {editing?.last4}. To change the
                card or account itself, remove and re-add it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-holder">Account holder name</Label>
                <Input
                  id="edit-holder"
                  name="edit-holder"
                  defaultValue={editing?.holder ?? ""}
                  required
                  className="min-h-11"
                />
              </div>
              {editing && !editing.isBank && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-expiry">Expiry</Label>
                  <Input
                    id="edit-expiry"
                    name="edit-expiry"
                    defaultValue={editing.expiry}
                    placeholder="MM / YY"
                    required
                    className="min-h-11"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="min-h-11">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(removing)}
          onOpenChange={(open) => !open && setRemoving(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove payment method?</DialogTitle>
              <DialogDescription>
                {removing?.isDefault
                  ? "This is your default payment method. Removing it will promote your most recent remaining method to default."
                  : "This method will no longer be available for rent payments."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => setRemoving(null)}
              >
                Keep method
              </Button>
              <Button
                variant="destructive"
                className="min-h-11 gap-2"
                onClick={confirmRemove}
              >
                <Trash2Icon className="size-4" />
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
