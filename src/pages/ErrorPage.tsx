import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const ErrorPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Result
      status="500"
      title={t('error.title')}
      subTitle={t('error.subTitle')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('error.backHome')}
        </Button>
      }
    />
  )
}