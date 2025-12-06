import { DatePicker, TimePicker, Upload, Button, Avatar, Badge, Tag, App } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { useState } from 'react'

export const DataEntryExample = () => {
  const { message } = App.useApp()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file])
      return false
    },
    fileList
  }

  const handleUpload = () => {
    // Simulate upload
    message.success('Files uploaded successfully!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Date and Time Pickers */}
      <div>
        <h3>Date & Time Selection</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <DatePicker placeholder="Select date" />
          <TimePicker placeholder="Select time" />
          <DatePicker.RangePicker placeholder={['Start date', 'End date']} />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <h3>File Upload</h3>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          style={{ marginTop: 16 }}
        >
          Upload Files
        </Button>
      </div>

      {/* Avatars and Badges */}
      <div>
        <h3>Avatars & Badges</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar size="large" icon={<UserOutlined />} />
          <Avatar size="large" src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
          <Badge count={5}>
            <Avatar size="large" icon={<UserOutlined />} />
          </Badge>
          <Badge count={99} style={{ backgroundColor: '#52c41a' }}>
            <Avatar size="large" icon={<UserOutlined />} />
          </Badge>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3>Tags</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="blue">Blue</Tag>
          <Tag color="green">Green</Tag>
          <Tag color="red">Red</Tag>
          <Tag color="orange">Orange</Tag>
          <Tag color="purple">Purple</Tag>
          <Tag closable>Closable</Tag>
        </div>
      </div>
    </div>
  )
}