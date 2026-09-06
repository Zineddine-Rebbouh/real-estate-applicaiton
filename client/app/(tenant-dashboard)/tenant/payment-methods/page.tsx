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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type PaymentMethod = {
  id: string;
  brand: "Visa" | "Mastercard" | "Bank";
  last4: string;
  expiry: string;
  type: string;
  isDefault: boolean;
  autoPay: boolean;
  nextCharge: string;
};

const initialMethods: PaymentMethod[] = [
  {
    id: "method-1",
    brand: "Visa",
    last4: "4242",
    expiry: "08/28",
    type: "Personal card",
    isDefault: true,
    autoPay: true,
    nextCharge: "Oct 1, 2026",
  },
  {
    id: "method-2",
    brand: "Mastercard",
    last4: "8210",
    expiry: "12/27",
    type: "Backup card",
    isDefault: false,
    autoPay: false,
    nextCharge: "Not scheduled",
  },
  {
    id: "method-3",
    brand: "Bank",
    last4: "1138",
    expiry: "Verified",
    type: "ACH bank account",
    isDefault: false,
    autoPay: false,
    nextCharge: "Not scheduled",
  },
];

function BrandMark({ brand }: { brand: PaymentMethod["brand"] }) {
  return (
    <div
      className={`flex size-11 items-center justify-center rounded-lg text-xs font-bold ${brand === "Visa" ? "bg-blue-600 text-white" : brand === "Mastercard" ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"}`}
    >
      {brand === "Bank" ? <Building2Icon className="size-5" /> : brand}
    </div>
  );
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(initialMethods);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");

  const addMethod = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newMethod: PaymentMethod = {
      id: `method-${Date.now()}`,
      brand: methodType === "card" ? "Visa" : "Bank",
      last4: methodType === "card" ? "9012" : "7744",
      expiry: methodType === "card" ? "09/29" : "Verified",
      type: methodType === "card" ? "New payment card" : "ACH bank account",
      isDefault: methods.length === 0,
      autoPay: false,
      nextCharge: "Not scheduled",
    };
    setMethods((current) => [...current, newMethod]);
    setAddOpen(false);
    toast.success("Payment method added", {
      description: "Your payment details are encrypted and ready to use.",
    });
  };

  const toggleAutoPay = (id: string, checked: boolean) =>
    setMethods((current) =>
      current.map((method) =>
        method.id === id
          ? {
              ...method,
              autoPay: checked,
              nextCharge: checked ? "Oct 1, 2026" : "Not scheduled",
            }
          : method,
      ),
    );
  const makeDefault = (id: string) => {
    setMethods((current) =>
      current.map((method) => ({ ...method, isDefault: method.id === id })),
    );
    toast.success("Default payment method updated");
  };
  const confirmRemove = () => {
    if (!removing) return;
    setMethods((current) =>
      current.filter((method) => method.id !== removing.id),
    );
    setRemoving(null);
    toast.success("Payment method removed");
  };

  return (
    <main className="min-h-full bg-muted/30">
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
          <Button
            className="min-h-11 gap-2 self-start sm:self-auto"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="size-4" />
            Add payment method
          </Button>
        </header>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-700">
              <AlertCircleIcon className="size-5" />
            </div>
            <div>
              <p className="font-semibold">
                Your last payment could not be processed
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your default method before Oct 1 to avoid a late payment.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="min-h-11 shrink-0 border-rose-500/30 text-rose-700 hover:bg-rose-500/10"
            onClick={() =>
              setEditing(methods.find((method) => method.isDefault) ?? null)
            }
          >
            Update payment method
          </Button>
        </div>

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
              <Button
                variant="outline"
                className="min-h-11 gap-2"
                onClick={() => setAddOpen(true)}
              >
                <PlusIcon className="size-4" />
                Add new
              </Button>
            </div>
            {methods.map((method) => (
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
                        {method.type} ·{" "}
                        {method.brand === "Bank"
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
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={method.autoPay}
                      onCheckedChange={(checked) =>
                        toggleAutoPay(method.id, checked)
                      }
                      aria-label={`Enable autopay for ${method.brand} ending in ${method.last4}`}
                    />
                    <div>
                      <p className="text-sm font-medium">Autopay</p>
                      <p className="text-xs text-muted-foreground">
                        {method.autoPay
                          ? `Next charge ${method.nextCharge}`
                          : "Pay manually when due"}
                      </p>
                    </div>
                  </div>
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
            ))}
            {methods.length === 0 && (
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
                    placeholder="DE89 3704 0044 0532 0130 00"
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
                Replace the details for {editing?.brand} ending in{" "}
                {editing?.last4}.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setEditing(null);
                toast.success("Payment method updated");
              }}
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="updated-number">
                  New card or account details
                </Label>
                <Input
                  id="updated-number"
                  placeholder="Enter updated details"
                  required
                  className="min-h-11"
                />
              </div>
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
                  ? "This is your default payment method. Removing it will pause autopay until you select another method."
                  : removing?.autoPay
                    ? "Autopay is enabled for this method. Removing it will stop future automatic charges."
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
