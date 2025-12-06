import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock RTK Query API calls
vi.mock('../store/api', () => {
  const mockApi = {
    reducerPath: 'api',
    reducer: vi.fn(() => ({})), // Return empty object as initial state
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    useGetSettingsQuery: vi.fn(() => ({
      data: {
        data: {
          theme: 'system',
          language: 'en',
          notifications: true,
          emailUpdates: false
        }
      },
      isLoading: false,
      error: null
    })),
    useUpdateSettingsMutation: vi.fn(() => [
      vi.fn(() => Promise.resolve({ data: { success: true } })),
      { isLoading: false, error: null }
    ]),
    useCreateSettingsMutation: vi.fn(() => [
      vi.fn(() => Promise.resolve({ data: { success: true } })),
      { isLoading: false, error: null }
    ]),
    useDeleteSettingsMutation: vi.fn(() => [
      vi.fn(() => Promise.resolve({ data: { success: true } })),
      { isLoading: false, error: null }
    ])
  }

  return {
    api: mockApi,
    ...mockApi
  }
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}