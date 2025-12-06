import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const NotFound = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Result
      status="404"
      title={t('notFound.title')}
      subTitle={t('notFound.subTitle')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('notFound.backHome')}
        </Button>
      }
    />
  )
}