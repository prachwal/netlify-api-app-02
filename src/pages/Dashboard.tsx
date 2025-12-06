import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Statistic from 'antd/es/statistic'
import { UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export const Dashboard = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <p style={{ marginBottom: 24 }}>{t('dashboard.description')}</p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Users"
              value={1128}
              prefix={<UserOutlined />}
              styles={{ content: { color: 'var(--success-color)' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Orders"
              value={342}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: 'var(--primary-color)' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Revenue"
              value={12893}
              prefix={<DollarOutlined />}
              precision={2}
              styles={{ content: { color: 'var(--error-color)' } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
