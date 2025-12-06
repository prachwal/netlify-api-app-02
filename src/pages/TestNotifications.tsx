import { Button, Card, Space, Divider, Row, Col, App } from 'antd'
import { SmileOutlined } from '@ant-design/icons'

export const TestNotifications = () => {
  const { message, notification } = App.useApp()
  // Message notifications (small from top)
  const showMessageSuccess = () => {
    message.success('This is a success message!')
  }

  const showMessageError = () => {
    message.error('This is an error message!')
  }

  const showMessageWarning = () => {
    message.warning('This is a warning message!')
  }

  const showMessageInfo = () => {
    message.info('This is an info message!')
  }

  const showMessageLoading = () => {
    const hide = message.loading('Action in progress..', 0)
    // Dismiss manually and asynchronously
    setTimeout(hide, 2500)
  }

  // Notification components (floating from side/bottom)
  const openNotificationSuccess = () => {
    notification.success({
      title: 'Success',
      description: 'This is a success notification!',
    })
  }

  const openNotificationError = () => {
    notification.error({
      title: 'Error',
      description: 'This is an error notification!',
    })
  }

  const openNotificationWarning = () => {
    notification.warning({
      title: 'Warning',
      description: 'This is a warning notification!',
    })
  }

  const openNotificationInfo = () => {
    notification.info({
      title: 'Info',
      description: 'This is an info notification!',
    })
  }

  const openNotificationWithIcon = () => {
    notification.open({
      title: 'Custom Notification',
      description: 'This notification has a custom icon.',
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    })
  }

  const openNotificationWithDuration = () => {
    notification.open({
      title: 'Custom Duration',
      description: 'This notification will stay for 10 seconds.',
      duration: 10,
    })
  }

  return (
    <div>
      <h1>Test Notifications</h1>
      <p>Test different types of notifications available in Ant Design</p>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Message Notifications (Small from Top)" size="small">
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button type="primary" onClick={showMessageSuccess}>
                Success Message
              </Button>
              <Button danger onClick={showMessageError}>
                Error Message
              </Button>
              <Button style={{ backgroundColor: '#faad14', borderColor: '#faad14' }} onClick={showMessageWarning}>
                Warning Message
              </Button>
              <Button type="default" onClick={showMessageInfo}>
                Info Message
              </Button>
              <Button type="dashed" onClick={showMessageLoading}>
                Loading Message (2.5s)
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Notification Components (Floating)" size="small">
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button type="primary" onClick={openNotificationSuccess} style={{ borderColor: '#52c41a', color: '#52c41a' }}>
                Success Notification (Top Right)
              </Button>
              <Button danger onClick={openNotificationError}>
                Error Notification (Top Left)
              </Button>
              <Button style={{ backgroundColor: '#faad14', borderColor: '#faad14' }} onClick={openNotificationWarning}>
                Warning Notification (Bottom Right)
              </Button>
              <Button type="default" onClick={openNotificationInfo}>
                Info Notification (Bottom Left)
              </Button>

              <Divider />

              <Button type="dashed" icon={<SmileOutlined />} onClick={openNotificationWithIcon}>
                Custom Icon Notification
              </Button>
              <Button type="text" onClick={openNotificationWithDuration}>
                Custom Duration (10s)
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Description" size="small">
        <p><strong>Message:</strong> Small notifications that appear at the top center of the screen. Perfect for quick feedback.</p>
        <p><strong>Notification:</strong> Larger floating notifications that can appear in different corners. Great for more detailed information.</p>
        <p>Both support different types: success, error, warning, and info.</p>
      </Card>
    </div>
  )
}
