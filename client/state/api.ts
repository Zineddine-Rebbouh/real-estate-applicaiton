import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
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
  tagTypes: ["Auth", "Properties", "ManagerProperties", "ManagerApplications", "Favorites", "TenantLeases", "TenantPayments", "Reviews"],
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
  status: "Pending" | "Approved" | "Denied";
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
  useCreateLeasePaymentMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCurrentLeaseQuery,
  useGetTenantPaymentsQuery,
  useGetPropertyReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = api;
