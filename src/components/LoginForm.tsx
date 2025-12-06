import { Button, Card, Form, Input, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

export const LoginForm = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const onFinish = (values: { email: string; password: string }) => {
    console.log('Login values:', values)
    message.success('Login successful!')
  }

  return (
    <Card title="Login" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}