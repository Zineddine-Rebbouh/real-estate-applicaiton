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

  const refreshResult = await rawBaseQuery(
    { url: "/api/auth/refresh", method: "POST" },
    api,
    extraOptions,
  );

  if (refreshResult.data) return rawBaseQuery(args, api, extraOptions);

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "api",
  tagTypes: ["Auth", "Properties", "ManagerProperties", "ManagerApplications"],
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
    updateApplicationStatus: build.mutation<{ application: ManagerApplication }, UpdateApplicationStatusRequest>({
      query: ({ id, status }) => ({
        url: `/api/applications/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ManagerApplications", "ManagerProperties"],
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
} = api;
