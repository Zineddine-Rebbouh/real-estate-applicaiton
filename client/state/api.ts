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
  tagTypes: ["Auth"],
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
  }),
});

export const api = apiSlice;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "TENANT" | "MANAGER";
};
export type AuthResponse = { user: AuthUser };
export type SignupRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
} = api;
