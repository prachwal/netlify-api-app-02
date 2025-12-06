import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { ConfigProvider, theme } from 'antd'
import './i18n/config'
import './index.css'
import App from './App.tsx'
import { store } from './store'
import type { RootState } from './store'

// eslint-disable-next-line react-refresh/only-export-components
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode)
  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </Provider>
  </StrictMode>,
)
