import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import settingsReducer, { setTheme, type ThemeMode } from '../store/settingsSlice'
import { useTheme } from './useTheme'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('useTheme', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
    })
    // Clear document body attributes
    document.body.removeAttribute('data-theme')
  })

  const renderHookWithStore = (initialTheme?: ThemeMode) => {
    if (initialTheme) {
      store.dispatch(setTheme(initialTheme))
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    return renderHook(() => useTheme(), { wrapper })
  }

  it('returns system theme by default', () => {
    mockMatchMedia(false)
    const { result } = renderHookWithStore()

    expect(result.current.isDark).toBe(false)
    expect(result.current.themeMode).toBe('system')
    expect(document.body.getAttribute('data-theme')).toBe('light')
  })

  it('returns dark theme when set to dark', () => {
    const { result } = renderHookWithStore('dark')

    expect(result.current.isDark).toBe(true)
    expect(result.current.themeMode).toBe('dark')
    expect(document.body.getAttribute('data-theme')).toBe('dark')
  })

  it('returns light theme when set to light', () => {
    const { result } = renderHookWithStore('light')

    expect(result.current.isDark).toBe(false)
    expect(result.current.themeMode).toBe('light')
    expect(document.body.getAttribute('data-theme')).toBe('light')
  })

  it('follows system preference when set to system and system is dark', () => {
    mockMatchMedia(true) // System prefers dark
    const { result } = renderHookWithStore('system')

    expect(result.current.isDark).toBe(true)
    expect(result.current.themeMode).toBe('system')
    expect(document.body.getAttribute('data-theme')).toBe('dark')
  })

  it('follows system preference when set to system and system is light', () => {
    mockMatchMedia(false) // System prefers light
    const { result } = renderHookWithStore('system')

    expect(result.current.isDark).toBe(false)
    expect(result.current.themeMode).toBe('system')
    expect(document.body.getAttribute('data-theme')).toBe('light')
  })

  // Note: Testing media query event listener changes is challenging due to React hook lifecycle.
  // The hook is designed to respond to Redux theme changes, and the system preference
  // is handled statically on mount. This covers the main use cases.

  it('updates theme when themeMode changes from light to dark', () => {
    const { result } = renderHookWithStore('light')

    expect(result.current.isDark).toBe(false)

    act(() => {
      store.dispatch(setTheme('dark'))
    })

    expect(result.current.isDark).toBe(true)
    expect(result.current.themeMode).toBe('dark')
  })

  it('updates theme when themeMode changes from dark to system', () => {
    mockMatchMedia(true) // System prefers dark
    const { result } = renderHookWithStore('dark')

    expect(result.current.isDark).toBe(true)
    expect(result.current.themeMode).toBe('dark')

    act(() => {
      store.dispatch(setTheme('system'))
    })

    expect(result.current.isDark).toBe(true)
    expect(result.current.themeMode).toBe('system')
    expect(document.body.getAttribute('data-theme')).toBe('dark')
  })
})
