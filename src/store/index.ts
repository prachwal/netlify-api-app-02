import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import settingsReducer from './settingsSlice'
import { api } from './api'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    settings: settingsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
