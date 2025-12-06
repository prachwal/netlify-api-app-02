import { Breadcrumb, Steps, Button, App } from 'antd'
import { HomeOutlined, UserOutlined, SolutionOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

export const NavigationExample = () => {
  const { message } = App.useApp()
  const [current, setCurrent] = useState(0)

  const steps = [
    {
      title: 'First',
      content: 'First-content',
      icon: <UserOutlined />
    },
    {
      title: 'Second',
      content: 'Second-content',
      icon: <SolutionOutlined />
    },
    {
      title: 'Last',
      content: 'Last-content',
      icon: <CheckCircleOutlined />
    }
  ]

  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const breadcrumbItems = [
    {
      href: '/',
      title: <HomeOutlined />
    },
    {
      href: '/users',
      title: 'Users'
    },
    {
      title: 'User Details'
    }
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 24 }} />

      <Steps current={current} items={steps} style={{ marginBottom: 24 }} />

      <div style={{ marginBottom: 24 }}>
        {steps[current].content}
      </div>

      <div>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={prev}>
            Previous
          </Button>
        )}
      </div>
    </div>
  )
}