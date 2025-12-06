import { describe, it, expect, beforeEach, vi } from 'vitest'
import settingsReducer, { setTheme, setLanguage, type ThemeMode, type Language } from './settingsSlice'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('settingsSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the initial state', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const state = settingsReducer(undefined, { type: undefined })
    expect(state).toEqual({ theme: 'system', language: 'en' })
  })

  it('should handle setTheme', () => {
    const initialState = { theme: 'system' as ThemeMode, language: 'en' as Language }
    const action = setTheme('dark')
    const state = settingsReducer(initialState, action)
    expect(state.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'dark')
  })

  it('should handle setLanguage', () => {
    const initialState = { theme: 'system' as ThemeMode, language: 'en' as Language }
    const action = setLanguage('pl')
    const state = settingsReducer(initialState, action)
    expect(state.language).toBe('pl')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'pl')
  })
})