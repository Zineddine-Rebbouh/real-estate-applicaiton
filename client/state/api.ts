import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  // ponytail: fail loud on missing env instead of silently sending relative requests
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002",
  credentials: "include",
});

let refreshPromise: Promise<unknown> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;
  const shouldRefresh =
    result.error?.status === 401 &&
    !["/api/auth/login", "/api/auth/signup", "/api/auth/refresh"].includes(url);

  if (!shouldRefresh) return result;

  // ponytail: single-flight refresh, parallel 401s share one call (rotation reuse would log user out)
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(
      rawBaseQuery(
        { url: "/api/auth/refresh", method: "POST" },
        api,
        extraOptions,
      ),
    ).finally(() => {
      refreshPromise = null;
    });
  }
  const refreshResult = await refreshPromise as { data?: unknown };

  if (refreshResult.data) return rawBaseQuery(args, api, extraOptions);

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "api",
  tagTypes: ["Auth", "Properties", "ManagerProperties", "ManagerApplications", "Favorites", "TenantLeases", "TenantPayments", "TenantApplications", "PaymentMethods", "Maintenance", "Inquiries", "Reviews"],
  endpoints: (build) => ({
    signup: build.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({ url: "/api/auth/signup", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({ url: "/api/auth/refresh", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
    getMe: build.query<{ user: AuthUser }, void>({
      query: () => "/api/auth/me",
      providesTags: ["Auth"],
    }),
    updateMe: build.mutation<
      { user: AuthUser },
      { name?: string; phoneNumber?: string | null }
    >({
      query: (body) => ({ url: "/api/auth/me", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),

    // Properties Endpoints
    getProperties: build.query<{ properties: Property[] }, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/api/properties",
        params: params || undefined,
      }),
      providesTags: ["Properties"],
    }),
    getPropertyById: build.query<{ property: Property }, string>({
      query: (id) => `/api/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Properties", id }],
    }),
    createProperty: build.mutation<{ property: Property }, Partial<Property>>({
      query: (body) => ({
        url: "/api/properties",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Properties", "ManagerProperties"],
    }),
    updateProperty: build.mutation<{ property: Property }, { id: string; data: Partial<Property> }>({
      query: ({ id, data }) => ({
        url: `/api/properties/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Properties", id },
        "Properties",
        "ManagerProperties",
      ],
    }),
    deleteProperty: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties", "ManagerProperties"],
    }),

    // Manager Dashboard Endpoints
    getManagerProperties: build.query<{ properties: Property[] }, void>({
      query: () => "/api/manager/properties",
      providesTags: ["ManagerProperties"],
    }),
    getManagerApplications: build.query<{ applications: ManagerApplication[] }, void>({
      query: () => "/api/manager/applications",
      providesTags: ["ManagerApplications"],
    }),
    updateApplicationStatus: build.mutation<{ application: ManagerApplication; lease?: Lease }, UpdateApplicationStatusRequest>({
      query: ({ id, status, startDate }) => ({
        url: `/api/applications/${id}`,
        method: "PATCH",
        body: startDate ? { status, startDate } : { status },
      }),
      invalidatesTags: ["ManagerApplications", "ManagerProperties"],
    }),
    createLeasePayment: build.mutation<{ payment: TenantPayment }, CreateLeasePaymentRequest>({
      query: ({ leaseId, ...body }) => ({
        url: `/api/manager/leases/${leaseId}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ManagerProperties", "TenantPayments"],
    }),

    // Tenant favorites (join table, newest first)
    getFavorites: build.query<{ favorites: Favorite[] }, void>({
      query: () => "/api/favorites",
      providesTags: ["Favorites"],
    }),
    addFavorite: build.mutation<{ favorite: Favorite }, string>({
      query: (propertyId) => ({
        url: "/api/favorites",
        method: "POST",
        body: { propertyId },
      }),
      invalidatesTags: ["Favorites"],
    }),
    removeFavorite: build.mutation<void, string>({
      query: (propertyId) => ({
        url: `/api/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorites"],
    }),

    // Tenant residence + payment history
    getCurrentLease: build.query<{ currentLease: Lease | null; pastLeases: Lease[] }, void>({
      query: () => "/api/tenant/current-lease",
      providesTags: ["TenantLeases"],
    }),
    getTenantPayments: build.query<{ payments: TenantPayment[] }, void>({
      query: () => "/api/tenant/payments",
      providesTags: ["TenantPayments"],
    }),
    payInvoice: build.mutation<{ payment: TenantPayment }, { id: string; amount?: number }>({
      query: ({ id, amount }) => ({
        url: `/api/tenant/payments/${id}/pay`,
        method: "PATCH",
        body: amount === undefined ? {} : { amount },
      }),
      invalidatesTags: ["TenantPayments"],
    }),

    // Tenant applications (submit / own list / withdraw)
    getTenantApplications: build.query<{ applications: TenantApplication[] }, void>({
      query: () => "/api/applications",
      providesTags: ["TenantApplications"],
    }),
    submitApplication: build.mutation<{ application: TenantApplication }, SubmitApplicationRequest>({
      query: (body) => ({
        url: "/api/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TenantApplications"],
    }),
    withdrawApplication: build.mutation<{ application: TenantApplication }, string>({
      query: (id) => ({
        url: `/api/applications/${id}/withdraw`,
        method: "PATCH",
      }),
      invalidatesTags: ["TenantApplications", "ManagerApplications"],
    }),

    // Tenant payment-method references (brand/last4 only — never PANs)
    getPaymentMethods: build.query<{ paymentMethods: PaymentMethod[] }, void>({
      query: () => "/api/payment-methods",
      providesTags: ["PaymentMethods"],
    }),
    addPaymentMethod: build.mutation<{ paymentMethod: PaymentMethod }, AddPaymentMethodRequest>({
      query: (body) => ({
        url: "/api/payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    updatePaymentMethod: build.mutation<{ paymentMethod: PaymentMethod }, { id: string; data: UpdatePaymentMethodRequest }>({
      query: ({ id, data }) => ({
        url: `/api/payment-methods/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    removePaymentMethod: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/payment-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethods"],
    }),

    // Maintenance requests (tenant report + own list, manager queue)
    getTenantMaintenance: build.query<{ maintenanceRequests: MaintenanceRequest[] }, void>({
      query: () => "/api/maintenance",
      providesTags: ["Maintenance"],
    }),
    createMaintenanceRequest: build.mutation<{ maintenanceRequest: MaintenanceRequest }, { propertyId: string; title: string; description: string }>({
      query: (body) => ({
        url: "/api/maintenance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Maintenance"],
    }),
    getManagerMaintenance: build.query<{ maintenanceRequests: ManagerMaintenanceRequest[] }, void>({
      query: () => "/api/manager/maintenance",
      providesTags: ["Maintenance"],
    }),
    updateMaintenanceStatus: build.mutation<{ maintenanceRequest: MaintenanceRequest }, { id: string; status: MaintenanceRequest["status"] }>({
      query: ({ id, status }) => ({
        url: `/api/maintenance/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Maintenance"],
    }),

    // Tours + contact messages (tenant submit, manager queue)
    submitTourRequest: build.mutation<{ tourRequest: TourRequest }, { propertyId: string; tourType: "InPerson" | "Video"; preferredDate: string; preferredTime: string; note?: string }>({
      query: (body) => ({
        url: "/api/tours",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inquiries"],
    }),
    sendContactMessage: build.mutation<{ contactMessage: ContactMessage }, { propertyId: string; message: string }>({
      query: (body) => ({
        url: "/api/messages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inquiries"],
    }),
    getManagerTourRequests: build.query<{ tourRequests: ManagerTourRequest[] }, void>({
      query: () => "/api/manager/tours",
      providesTags: ["Inquiries"],
    }),
    getManagerContactMessages: build.query<{ contactMessages: ManagerContactMessage[] }, void>({
      query: () => "/api/manager/messages",
      providesTags: ["Inquiries"],
    }),
    updateTourStatus: build.mutation<{ tourRequest: TourRequest }, { id: string; status: "Pending" | "Confirmed" | "Declined" }>({
      query: ({ id, status }) => ({
        url: `/api/tours/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Inquiries"],
    }),

    // Reviews (public list, tenant create/delete)
    getPropertyReviews: build.query<{ reviews: Review[]; averageRating: number | null; numberOfReviews: number }, string>({
      query: (propertyId) => `/api/reviews/property/${propertyId}`,
      providesTags: (_result, _error, propertyId) => [{ type: "Reviews", id: propertyId }],
    }),
    createReview: build.mutation<{ review: Review }, { propertyId: string; rating: number; comment?: string }>({
      query: ({ propertyId, rating, comment }) => ({
        url: `/api/reviews/property/${propertyId}`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [{ type: "Reviews", id: propertyId }, "Properties"],
    }),
    deleteReview: build.mutation<void, { id: string; propertyId: string }>({
      query: ({ id }) => ({
        url: `/api/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [{ type: "Reviews", id: propertyId }, "Properties"],
    }),
  }),
});

export const api = apiSlice;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "TENANT" | "MANAGER";
  phoneNumber?: string | null;
};
export type MaintenanceRequest = {
  id: string;
  propertyId: string;
  tenantId: string;
  leaseId?: string | null;
  title: string;
  description: string;
  status: "Open" | "InProgress" | "Resolved";
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    photoUrls: string[];
  };
};

export type ManagerMaintenanceRequest = MaintenanceRequest & {
  tenant: {
    phoneNumber?: string | null;
    user?: { name: string; email: string };
  };
};

export type TourRequest = {
  id: string;
  propertyId: string;
  tenantId: string;
  name: string;
  email: string;
  tourType: "InPerson" | "Video";
  preferredDate: string;
  preferredTime: string;
  note?: string | null;
  status: "Pending" | "Confirmed" | "Declined";
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    photoUrls: string[];
  };
};

export type ManagerTourRequest = TourRequest & {
  tenant: {
    phoneNumber?: string | null;
    user?: { name: string; email: string };
  };
};

export type ContactMessage = {
  id: string;
  propertyId: string;
  tenantId: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    photoUrls: string[];
  };
};

export type ManagerContactMessage = ContactMessage & {
  tenant: {
    phoneNumber?: string | null;
    user?: { name: string; email: string };
  };
};

export type AuthResponse = { user: AuthUser };
export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  role?: "TENANT" | "MANAGER";
  inviteCode?: string;
};
export type LoginRequest = { email: string; password: string };

export type Property = {
  id: string;
  managerId: string;
  name: string;
  description: string;
  pricePerMonth: number | string;
  securityDeposit: number | string;
  applicationFee: number | string;
  photoUrls: string[];
  amenities: string[];
  highlights: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  averageRating?: number | null;
  numberOfReviews?: number;
  latitude?: number | null;
  longitude?: number | null;
  availableFrom?: string | null;
  createdAt?: string;
  updatedAt?: string;
  manager?: {
    id: string;
    phoneNumber?: string | null;
    user?: { name: string; email: string };
  };
  pendingApplicationsCount?: number;
  totalApplicationsCount?: number;
  activeLeasesCount?: number;
  leases?: { id: string; startDate: string; endDate: string; rent: number | string }[];
};

export type ManagerApplication = {
  id: string;
  propertyId: string;
  tenantId: string;
  applicationDate: string;
  status: "Pending" | "Approved" | "Denied" | "Withdrawn";
  name: string;
  email: string;
  phoneNumber: string;
  message?: string | null;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pricePerMonth: number | string;
    photoUrls: string[];
    beds: number;
    baths: number;
    squareFeet: number;
  };
  tenant?: {
    id: string;
    phoneNumber?: string | null;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export type UpdateApplicationStatusRequest = {
  id: string;
  status: "Pending" | "Approved" | "Denied";
  startDate?: string;
};

export type Lease = {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: number | string;
  deposit: number | string;
  property?: Property;
};

export type Favorite = {
  id: string;
  tenantId: string;
  propertyId: string;
  createdAt: string;
  property: Property;
};

export type TenantApplication = {
  id: string;
  propertyId: string;
  tenantId: string;
  leaseId?: string | null;
  applicationDate: string;
  status: "Pending" | "Approved" | "Denied" | "Withdrawn";
  name: string;
  email: string;
  phoneNumber: string;
  message?: string | null;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pricePerMonth: number | string;
    photoUrls: string[];
    beds: number;
    baths: number;
    squareFeet: number;
    manager?: {
      phoneNumber?: string | null;
      user?: { name: string; email: string };
    };
  };
  lease?: { startDate: string; endDate: string } | null;
};

export type SubmitApplicationRequest = {
  propertyId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
};

export type PaymentMethod = {
  id: string;
  tenantId: string;
  type: "Card" | "Bank";
  brand?: string | null;
  last4: string;
  expMonth?: number | null;
  expYear?: number | null;
  accountHolder: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddPaymentMethodRequest = {
  type: "Card" | "Bank";
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  accountHolder: string;
  isDefault?: boolean;
};

export type UpdatePaymentMethodRequest = {
  accountHolder?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
};

export type TenantPayment = {
  id: string;
  leaseId: string;
  amountDue: number | string;
  amountPaid: number | string;
  dueDate: string;
  paymentDate?: string | null;
  paymentStatus: "Pending" | "Paid" | "PartiallyPaid" | "Overdue";
  lease?: {
    id: string;
    startDate: string;
    endDate: string;
    property?: { id: string; name: string; address: string } | null;
  };
};

export type CreateLeasePaymentRequest = {
  leaseId: string;
  amountDue: number | string;
  amountPaid?: number | string;
  dueDate: string;
  paymentDate?: string;
  paymentStatus?: TenantPayment["paymentStatus"];
};

export type Review = {
  id: string;
  propertyId: string;
  tenantId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  tenant?: { user?: { id: string; name: string } };
};

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetManagerPropertiesQuery,
  useGetManagerApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetTenantApplicationsQuery,
  useSubmitApplicationMutation,
  useWithdrawApplicationMutation,
  useCreateLeasePaymentMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCurrentLeaseQuery,
  useGetTenantPaymentsQuery,
  usePayInvoiceMutation,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useGetTenantMaintenanceQuery,
  useCreateMaintenanceRequestMutation,
  useGetManagerMaintenanceQuery,
  useUpdateMaintenanceStatusMutation,
  useSubmitTourRequestMutation,
  useSendContactMessageMutation,
  useGetManagerTourRequestsQuery,
  useGetManagerContactMessagesQuery,
  useUpdateTourStatusMutation,
  useGetPropertyReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = api;
