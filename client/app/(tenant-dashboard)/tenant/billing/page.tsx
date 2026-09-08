"use client";

import { Fragment, useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  DownloadIcon,
  FileDownIcon,
  FileTextIcon,
  ReceiptTextIcon,
  SearchIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { downloadReceipt, downloadStatement } from "@/lib/utils";
import { useGetTenantPaymentsQuery, type TenantPayment } from "@/state/api";

type TransactionStatus = TenantPayment["paymentStatus"];
type Transaction = {
  id: string;
  paymentId: string;
  date: string;
  property: string;
  amount: number;
  paid: number;
  balance: number;
  status: TransactionStatus;
  lineItems: { label: string; amount: number }[];
};

function toTransaction(payment: TenantPayment): Transaction {
  const due = Number(payment.amountDue);
  const paid = Number(payment.amountPaid);
  return {
    id: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
    paymentId: payment.id,
    date: new Date(payment.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    property: payment.lease?.property?.name ?? "Lease payment",
    amount: due,
    paid,
    balance: due - paid,
    status: payment.paymentStatus,
    lineItems: [
      { label: "Amount due", amount: due },
      { label: "Amount paid", amount: paid },
      { label: "Balance", amount: due - paid },
    ],
  };
}

function downloadCsv(filename: string, rows: Transaction[]) {
  const header = "Reference,Date,Property,Amount Due,Amount Paid,Balance,Status";
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows
    .map((t) =>
      [t.id, t.date, t.property, t.amount.toFixed(2), t.paid.toFixed(2), t.balance.toFixed(2), t.status]
        .map(escape)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([[header, body].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const statusDetails: Record<
  TransactionStatus,
  { icon: typeof CheckCircle2Icon; className: string }
> = {
  Paid: {
    icon: CheckCircle2Icon,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  },
  Pending: {
    icon: Clock3Icon,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  },
  PartiallyPaid: {
    icon: ReceiptTextIcon,
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700",
  },
  Overdue: {
    icon: XCircleIcon,
    className: "border-rose-500/20 bg-rose-500/10 text-rose-700",
  },
};

const currency = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

function StatusBadge({ status }: { status: TransactionStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${detail.className}`}>
      <Icon className="size-3.5" />
      {status}
    </Badge>
  );
}

function SpendChart({ values }: { values: { label: string; amount: number }[] }) {
  const max = Math.max(1, ...values.map((v) => v.amount));
  return (
    <div
      className="flex h-20 items-end gap-1.5"
      aria-label="Monthly spend trend"
    >
      {values.map((bar, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${index === values.length - 1 ? "bg-primary" : "bg-primary/20"}`}
            style={{ height: `${Math.max(6, (bar.amount / max) * 100)}%` }}
          />
          <span className="text-[10px] text-muted-foreground">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" });

export default function BillingHistoryPage() {
  const { data, isLoading, isError } = useGetTenantPaymentsQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | TransactionStatus>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const transactions = useMemo(
    () => (data?.payments ?? []).map(toTransaction),
    [data],
  );

  const totalPaid = useMemo(
    () => (data?.payments ?? []).reduce((sum, p) => sum + Number(p.amountPaid), 0),
    [data],
  );

  const nextDue = useMemo(
    () =>
      (data?.payments ?? [])
        .filter((p) => p.paymentStatus !== "Paid")
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0],
    [data],
  );

  const spendTrend = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (6 - i));
      return { label: monthLabel(d), amount: 0, key: `${d.getFullYear()}-${d.getMonth()}` };
    });
    for (const p of data?.payments ?? []) {
      const d = paymentDateOf(p);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.amount += Number(p.amountPaid);
    }
    return buckets;
  }, [data]);

  function paymentDateOf(p: TenantPayment) {
    return new Date(p.paymentDate ?? p.dueDate);
  }

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesQuery =
          transaction.property.toLowerCase().includes(query.toLowerCase()) ||
          transaction.id.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === "All" || transaction.status === status;
        const parsedDate = new Date(transaction.date).getTime();
        const matchesFrom =
          !fromDate || parsedDate >= new Date(fromDate).getTime();
        const matchesTo =
          !toDate || parsedDate <= new Date(`${toDate}T23:59:59`).getTime();
        return matchesQuery && matchesStatus && matchesFrom && matchesTo;
      }),
    [fromDate, query, status, toDate, transactions],
  );

  const visibleTransactions = filteredTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );

  const handleDownloadReceipt = async (transaction: Transaction) => {
    try {
      await downloadReceipt(transaction.paymentId, `Receipt_${transaction.id}.pdf`);
      toast.success(`Receipt ${transaction.id} downloaded`);
    } catch {
      toast.error(`Couldn't download receipt ${transaction.id}`);
    }
  };

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Billing History
              </h1>
              {/* <Badge variant="outline" className="text-xs">
                2026
              </Badge> */}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Review rent payments, receipts, and account activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="min-h-11 gap-2"
              onClick={() => {
                downloadCsv("billing-history.csv", filteredTransactions);
                toast.success("CSV export downloaded", {
                  description: `${filteredTransactions.length} records.`,
                });
              }}
            >
              <DownloadIcon className="size-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="min-h-11 gap-2"
              onClick={async () => {
                try {
                  await downloadStatement({ from: fromDate, to: toDate });
                  toast.success("PDF statement downloaded");
                } catch {
                  toast.error("Couldn't download the PDF statement");
                }
              }}
            >
              <FileDownIcon className="size-4" />
              Export PDF
            </Button>
          </div>
        </header>
        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Billing summary"
        >
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total paid this year
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {currency(totalPaid)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across all your leases
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-700">
                <CheckCircle2Icon className="size-5" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Next payment due
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {nextDue
                    ? new Date(nextDue.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextDue
                    ? `${currency(Number(nextDue.amountDue))} · ${nextDue.lease?.property?.name ?? "Lease payment"}`
                    : "Nothing outstanding"}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <CalendarDaysIcon className="size-5" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Spend trend
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Consistent month to month
                </p>
              </div>
              <span className="text-xs text-muted-foreground">Mar–Sep</span>
            </div>
            <SpendChart values={spendTrend} />
          </Card>
        </section>
        <Card className="overflow-visible p-0">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-semibold">Transactions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredTransactions.length} records match your filters.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(200px,1fr)_auto_auto]">
              <label className="relative">
                <span className="sr-only">Search transactions</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search property or ID"
                  className="min-h-11 pl-9"
                />
              </label>
              <label>
                <span className="sr-only">Filter from date</span>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-11"
                />
              </label>
              <label>
                <span className="sr-only">Filter to date</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value);
                    setPage(1);
                  }}
                  className="min-h-11"
                />
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-5">
            {(["All", "Paid", "Pending", "PartiallyPaid", "Overdue"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setStatus(filter);
                    setPage(1);
                  }}
                  className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ${status === filter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  aria-pressed={status === filter}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <XCircleIcon className="size-8 text-destructive" />
              <h3 className="mt-3 text-base font-semibold">
                Couldn&apos;t load your payments
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please try again later.
              </p>
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <FileTextIcon className="size-8 text-muted-foreground" />
              <h3 className="mt-3 text-base font-semibold">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try clearing a filter or searching for another property.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Property</th>
                      <th className="px-3 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTransactions.map((transaction) => {
                      const isExpanded = expanded === transaction.id;
                      return (
                        <Fragment key={transaction.id}>
                          <tr className="border-b">
                            <td className="px-5 py-4 align-top text-muted-foreground">
                              {transaction.date}
                            </td>
                            <td className="px-3 py-4 align-top">
                              <p className="font-medium">
                                {transaction.property}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {transaction.id}
                              </p>
                            </td>
                            <td className="px-3 py-4 text-right align-top font-semibold">
                              {currency(transaction.amount)}
                            </td>
                            <td className="px-3 py-4 align-top">
                              <StatusBadge status={transaction.status} />
                            </td>
                            <td className="px-5 py-3 align-top">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  className="min-h-11 gap-1.5"
                                  onClick={() =>
                                    setExpanded(
                                      isExpanded ? null : transaction.id,
                                    )
                                  }
                                  aria-expanded={isExpanded}
                                >
                                  <ChevronDownIcon
                                    className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                  Details
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-11"
                                  aria-label={`Download invoice ${transaction.id}`}
                                  onClick={() => handleDownloadReceipt(transaction)}
                                >
                                  <DownloadIcon className="size-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${transaction.id}-details`}>
                              <td colSpan={5} className="bg-muted/25 px-5 pb-4">
                                <div className="grid gap-2 border-l-2 border-primary/30 pl-4 text-sm sm:max-w-md">
                                  {transaction.lineItems.map((item) => (
                                    <div
                                      key={item.label}
                                      className="flex justify-between gap-4"
                                    >
                                      <span className="text-muted-foreground">
                                        {item.label}
                                      </span>
                                      <span className="font-medium">
                                        {currency(item.amount)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
                                    <span>Total</span>
                                    <span>{currency(transaction.amount)}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y md:hidden">
                {visibleTransactions.map((transaction) => {
                  const isExpanded = expanded === transaction.id;
                  return (
                    <article key={transaction.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{transaction.property}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {transaction.date} · {transaction.id}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {currency(transaction.amount)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <StatusBadge status={transaction.status} />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-11"
                            aria-label={`Download invoice ${transaction.id}`}
                            onClick={() => handleDownloadReceipt(transaction)}
                          >
                            <DownloadIcon className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-11"
                            onClick={() =>
                              setExpanded(isExpanded ? null : transaction.id)
                            }
                          >
                            {isExpanded ? "Hide" : "Details"}
                          </Button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
                          {transaction.lineItems.map((item) => (
                            <div
                              key={item.label}
                              className="flex justify-between"
                            >
                              <span className="text-muted-foreground">
                                {item.label}
                              </span>
                              <span>{currency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
          {visibleTransactions.length > 0 && (
            <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span>
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredTransactions.length)} of{" "}
                {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="min-w-16 text-center text-foreground">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11"
                  disabled={page === pageCount}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <p>
            <span className="font-semibold text-foreground">
              Need help with a charge?
            </span>
            <span className="ml-1 text-muted-foreground">
              Contact support with your transaction ID and we will review it
              with you.
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
