import { StrictMode, useState, useEffect } from 'react'
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
  const themeMode = useSelector((state: RootState) => state.settings.theme)
  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          Message: {
            zIndexPopup: 2000,
          },
          Notification: {
            zIndexPopup: 2000,
          },
          Input: {
            colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
            colorBgContainerDisabled: isDark ? '#141414' : '#f5f5f5',
            colorBorder: isDark ? '#434343' : '#d9d9d9',
            colorText: isDark ? '#ffffff' : '#000000',
            colorTextPlaceholder: isDark ? '#8c8c8c' : '#bfbfbf',
          },
          Button: {
            colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
            colorBgContainerDisabled: isDark ? '#141414' : '#f5f5f5',
            colorBorder: isDark ? '#434343' : '#d9d9d9',
            colorText: isDark ? '#ffffff' : '#000000',
          },
          Select: {
            colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
            colorBgContainerDisabled: isDark ? '#141414' : '#f5f5f5',
            colorBorder: isDark ? '#434343' : '#d9d9d9',
            colorText: isDark ? '#ffffff' : '#000000',
          },
        },
        token: {
          colorBgContainer: isDark ? '#141414' : '#ffffff',
          colorText: isDark ? '#ffffff' : '#000000',
          colorBorder: isDark ? '#434343' : '#d9d9d9',
          borderRadius: isMobile ? 6 : 8,
        },
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
