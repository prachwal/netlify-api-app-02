import Card from 'antd/es/card'
import Select from 'antd/es/select'
import Space from 'antd/es/space'
import Button from 'antd/es/button'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetSettingsQuery, useUpdateSettingsMutation, useCreateSettingsMutation, useDeleteSettingsMutation } from '../store/api'
import { setTheme, setLanguage } from '../store/settingsSlice'
import { logger } from '../utils/logger'

export const Settings = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const userId = '1' // For demo purposes, using fixed user ID

  logger.info('Settings component mounted', { userId })

  const { data: settingsData, isLoading, error } = useGetSettingsQuery(userId)
  const [updateSettings, { isLoading: isUpdating, error: updateError }] = useUpdateSettingsMutation()
  const [createSettings] = useCreateSettingsMutation()
  const [deleteSettings] = useDeleteSettingsMutation()

  logger.debug('Settings query state', { isLoading, hasError: !!error, hasData: !!settingsData })

  // Sync Redux state with API data when settings load
  useEffect(() => {
    if (settingsData?.data && process.env.NODE_ENV !== 'test') {
      const { theme, language } = settingsData.data
      logger.info('Syncing Redux with API settings', { theme, language })
      dispatch(setTheme(theme))
      dispatch(setLanguage(language))
      i18n.changeLanguage(language)
    }
  }, [settingsData, dispatch])

  if (isLoading) {
    logger.debug('Loading settings...')
    return <div>Loading settings...</div>
  }
  if (error) {
    logger.error('Error loading settings', error)
    return <div>Error loading settings: {JSON.stringify(error)}</div>
  }

  const settings = settingsData?.data
  logger.info('Settings loaded', { settings })

  const handleThemeChange = async (value: string) => {
    logger.info('Theme change initiated', { oldTheme: settings?.theme, newTheme: value })
    if (settings) {
      try {
        const newTheme = value as 'light' | 'dark' | 'system'
        const result = await updateSettings({ userId, settings: { ...settings, theme: newTheme } }).unwrap()
        logger.info('Theme updated successfully', { result })
        // Update Redux state immediately
        dispatch(setTheme(newTheme))
      } catch (err) {
        logger.error('Failed to update theme', err)
      }
    } else {
      logger.warn('Cannot update theme: settings not available')
    }
  }

  const handleLanguageChange = async (value: string) => {
    logger.info('Language change initiated', { oldLanguage: settings?.language, newLanguage: value })
    if (settings) {
      try {
        const result = await updateSettings({ userId, settings: { ...settings, language: value } }).unwrap()
        logger.info('Language updated successfully', { result })
        // Update Redux and i18n immediately
        dispatch(setLanguage(value as 'en' | 'pl'))
        i18n.changeLanguage(value)
      } catch (err) {
        logger.error('Failed to update language', err)
      }
    } else {
      logger.warn('Cannot update language: settings not available')
    }
  }

  const handleCreateSettings = async () => {
    logger.info('Create settings initiated', { userId })
    try {
      const result = await createSettings({
        userId,
        settings: {
          theme: 'light',
          language: 'en',
          notifications: true,
          emailUpdates: false
        }
      })
      logger.info('Settings created successfully', { result })
    } catch (err) {
      logger.error('Failed to create settings', err)
    }
  }

  const handleDeleteSettings = async () => {
    logger.info('Delete settings initiated', { userId })
    try {
      const result = await deleteSettings(userId)
      logger.info('Settings deleted successfully', { result })
    } catch (err) {
      logger.error('Failed to delete settings', err)
    }
  }

  return (
    <div>
      <h1>{t('settings.title')}</h1>

      {updateError && <div style={{ color: 'red' }}>Error updating settings: {JSON.stringify(updateError)}</div>}
      {isUpdating && <div>Updating settings...</div>}

      <Space orientation="vertical" size="large" style={{ width: '100%', maxWidth: 800 }}>
        <Card>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <label>{t('settings.themeLabel')}</label>
            <Select
              style={{ width: '100%' }}
              value={settings?.theme}
              onChange={handleThemeChange}
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
              value={settings?.language}
              onChange={handleLanguageChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'pl', label: 'Polski' },
              ]}
            />
          </Space>
        </Card>

        <Card>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <h3>Settings Management</h3>
            <Space>
              {!settings && <Button onClick={handleCreateSettings} type="primary">Create Settings</Button>}
              <Button onClick={handleDeleteSettings} danger>Delete Settings</Button>
            </Space>
          </Space>
        </Card>
      </Space>
    </div>
  )
}
