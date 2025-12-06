import Card from 'antd/es/card'
import Select from 'antd/es/select'
import Space from 'antd/es/space'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { setTheme, setLanguage, type ThemeMode, type Language } from '../store/settingsSlice'
import { useTheme } from '../hooks/useTheme'

export const Settings = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { themeMode } = useTheme()
  const language = useSelector((state: RootState) => state.settings.language)

  return (
    <div>
      <h1>{t('settings.title')}</h1>

      <Space orientation="vertical" size="large" style={{ width: '100%', maxWidth: 800 }}>
        <Card>
          <Space orientation="vertical" style={{ width: '100%' }}>
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
          <Space orientation="vertical" style={{ width: '100%' }}>
            <label>{t('settings.languageLabel')}</label>
            <Select
              style={{ width: '100%' }}
              value={language}
              onChange={(value: Language) => {
                dispatch(setLanguage(value))
                i18n.changeLanguage(value)
              }}
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
