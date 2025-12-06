import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'en' | 'pl'

interface SettingsState {
  theme: ThemeMode
  language: Language
}

const getInitialSettings = (): SettingsState => {
  const theme = (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
  const language = (localStorage.getItem('language') as Language) || 'en'
  return { theme, language }
}

const initialState: SettingsState = getInitialSettings()

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
      localStorage.setItem('theme-mode', action.payload)
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    },
  },
})

export const { setTheme, setLanguage } = settingsSlice.actions
export default settingsSlice.reducer
