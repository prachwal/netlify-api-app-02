import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.settings.theme)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const updateTheme = () => {
      if (themeMode === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(systemDark)
        document.body.setAttribute('data-theme', systemDark ? 'dark' : 'light')
      } else {
        setIsDark(themeMode === 'dark')
        document.body.setAttribute('data-theme', themeMode)
      }
    }

    updateTheme()

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => updateTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [themeMode])

  return { isDark, themeMode }
}
