import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Statistic from 'antd/es/statistic'
import { UserOutlined, DollarOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useGetDashboardQuery } from '../store/api'

export const Dashboard = () => {
  const { t } = useTranslation()
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery(undefined)

  if (isLoading) return <div>Loading dashboard...</div>
  if (error) return <div>Error loading dashboard</div>

  const data = dashboardData

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <p style={{ marginBottom: 24 }}>{t('dashboard.description')}</p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <Card>
            <Statistic
              title="Users"
              value={data?.totalUsers || 0}
              prefix={<UserOutlined />}
              styles={{ content: { color: 'var(--success-color)' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={data?.activeUsers || 0}
              prefix={<UserOutlined />}
              styles={{ content: { color: 'var(--primary-color)' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={data?.totalRevenue || 0}
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
