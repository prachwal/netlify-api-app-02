import { Progress, Skeleton, Spin, Alert, Result } from 'antd'
import { useState, useEffect } from 'react'

export const FeedbackComponents = () => {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setLoading(false)
          clearInterval(timer)
          return 100
        }
        return prevProgress + 10
      })
    }, 500)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div>
        <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />

        <Progress percent={progress} status="active" />

        <div style={{ marginTop: 24 }}>
          <Skeleton active />
          <Skeleton active style={{ marginTop: 16 }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Alert
        title="Success!"
        description="Data loaded successfully."
        type="success"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Result
        status="success"
        title="Successfully Completed!"
        subTitle="Your operation was successful."
        extra={[
          <a key="console" href="/dashboard">Go to Dashboard</a>,
          <a key="buy" href="/settings">Go to Settings</a>
        ]}
      />
    </div>
  )
}