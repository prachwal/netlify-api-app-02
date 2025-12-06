import { Card, Select, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import { setTheme } from '../store/themeSlice'
import type { ThemeMode } from '../store/themeSlice'
import { useTheme } from '../hooks/useTheme'

export const Settings = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { themeMode } = useTheme()

  return (
    <div>
      <h1>{t('settings.title')}</h1>

      <Space orientation="vertical" size="large" style={{ width: '100%', maxWidth: 600 }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <label>{t('settings.themeLabel')}</label>
            <Select
              style={{ width: '100%' }}
              value={themeMode}
              onChange={(value: ThemeMode) => dispatch(setTheme(value))}
              options={[
                { value: 'light', label: t('theme.light') },
                { value: 'dark', label: t('theme.dark') },
                { value: 'system', label: t('theme.system') },
              ]}
            />
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <label>{t('settings.languageLabel')}</label>
            <Select
              style={{ width: '100%' }}
              value={i18n.language}
              onChange={(value: string) => i18n.changeLanguage(value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'pl', label: 'Polski' },
              ]}
            />
          </Space>
        </Card>
      </Space>
    </div>
  )
}
