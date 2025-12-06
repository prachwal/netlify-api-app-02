import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/.netlify/functions',
    // For Netlify Functions, we call them directly
    prepareHeaders: (headers) => {
      // Add any headers you need
      return headers
    },
  }),
  tagTypes: ['User', 'Dashboard', 'Settings'],
  endpoints: (builder) => ({
    // Example endpoint for user data
    getUser: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Endpoint for all users
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User'],
    }),

    // Create user
    createUser: builder.mutation({
      query: (user) => ({
        url: 'users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation({
      query: ({ id, ...user }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Example endpoint for dashboard data
    getDashboard: builder.query({
      query: () => 'dashboard',
      transformResponse: (response: { status: boolean; data: any; metadata: any }) => response.data,
      providesTags: ['Dashboard'],
    }),

    // Example mutation endpoint
    updateUserSettings: builder.mutation({
      query: ({ userId, settings }) => ({
        url: `users/${userId}/settings`,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: [{ type: 'User' }, 'Settings'],
    }),

    // Endpoint for the existing demo function
    getDemo: builder.query({
      query: () => 'demo',
      providesTags: ['Dashboard'],
    }),

    // Settings endpoints
    getSettings: builder.query({
      query: (userId) => `settings/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'Settings', id: userId }],
    }),

    createSettings: builder.mutation({
      query: ({ userId, settings }) => ({
        url: `settings/${userId}`,
        method: 'POST',
        body: settings,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Settings', id: userId }],
    }),

    updateSettings: builder.mutation({
      query: ({ userId, settings }) => ({
        url: `settings/${userId}`,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Settings', id: userId }],
    }),

    deleteSettings: builder.mutation({
      query: (userId) => ({
        url: `settings/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'Settings', id: userId }],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetUserQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDashboardQuery,
  useUpdateUserSettingsMutation,
  useGetDemoQuery,
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useDeleteSettingsMutation,
} = api
