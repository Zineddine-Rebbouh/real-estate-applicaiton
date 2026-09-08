import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEnumString(str: string) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

export function formatPriceValue(value: number | null, isMin?: boolean) {
  if (value === null || value === 0) {
    if (isMin === undefined) return "Price on request";
    return isMin ? "Any Min Price" : "Any Max Price";
  }
  if (value >= 1000) {
    const kValue = value / 1000;
    const kDisplay = Number.isInteger(kValue)
      ? `${kValue}k`
      : `${kValue.toFixed(1)}k`;
    if (isMin === undefined) return `$${kDisplay}`;
    return isMin ? `$${kDisplay}+` : `<$${kDisplay}`;
  }
  if (isMin === undefined) return `$${value}`;
  return isMin ? `$${value}+` : `<$${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanParams(params: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(params).filter(
      (
        [_, value] // eslint-disable-line @typescript-eslint/no-unused-vars
      ) =>
        value !== undefined &&
        value !== "any" &&
        value !== "" &&
        (Array.isArray(value) ? value.some((v) => v !== null) : value !== null)
    )
  );
}

type MutationMessages = {
  success?: string;
  error: string;
};

export const withToast = async <T>(
  mutationFn: Promise<T>,
  messages: Partial<MutationMessages>
) => {
  const { success, error } = messages;

  try {
    const result = await mutationFn;
    if (success) toast.success(success);
    return result;
  } catch (err) {
    if (error) toast.error(error);
    throw err;
  }
};

export const createNewUserInDatabase = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idToken: any,
  userRole: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchWithBQ: any
) => {
  const createEndpoint =
    userRole?.toLowerCase() === "manager" ? "/managers" : "/tenants";

  const createUserResponse = await fetchWithBQ({
    url: createEndpoint,
    method: "POST",
    body: {
      cognitoId: user.userId,
      name: user.username,
      email: idToken?.payload?.email || "",
      phoneNumber: "",
    },
  });

  if (createUserResponse.error) {
    throw new Error("Failed to create user record");
  }

  return createUserResponse;
};

// Downloads the signed lease agreement PDF for a lease the current user
// is a party to (tenant on the lease, or its property's manager).
export async function downloadLeaseAgreement(leaseId: string, filename: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leases/${leaseId}/agreement`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Opens the agreement in a new tab (server returns it inline).
export function openLeaseAgreement(leaseId: string) {
  window.open(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leases/${leaseId}/agreement?inline=1`,
    "_blank",
    "noopener",
  );
}

// Downloads the full payment-history statement PDF, honoring the same
// optional from/to (YYYY-MM-DD) due-date filters as the billing page.
export async function downloadStatement(params: { from?: string; to?: string }) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => Boolean(v))),
  ).toString();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tenant/payments/statement${query ? `?${query}` : ""}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Payment_Statement.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Downloads a single-invoice receipt PDF (same party rule as agreements).
export async function downloadReceipt(paymentId: string, filename: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leases/payments/${paymentId}/receipt`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
