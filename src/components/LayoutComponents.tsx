import { Drawer, Modal, Popover, Tooltip, Collapse, Tabs, Divider } from 'antd'
import { useState } from 'react'
import type { TabsProps } from 'antd'

export const LayoutComponents = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tab 1',
      children: 'Content of Tab 1'
    },
    {
      key: '2',
      label: 'Tab 2',
      children: 'Content of Tab 2'
    },
    {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab 3'
    }
  ]

  const collapseItems = [
    {
      key: '1',
      label: 'Panel 1',
      children: <p>This is panel 1 content</p>
    },
    {
      key: '2',
      label: 'Panel 2',
      children: <p>This is panel 2 content</p>
    },
    {
      key: '3',
      label: 'Panel 3',
      children: <p>This is panel 3 content</p>
    }
  ]

  return (
    <div>
      <h2>Layout Components</h2>

      {/* Buttons to trigger components */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <button onClick={() => setDrawerVisible(true)}>Open Drawer</button>
        <button onClick={() => setModalVisible(true)}>Open Modal</button>
      </div>

      {/* Drawer */}
      <Drawer
        title="Settings"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        size={400}
      >
        <p>Drawer content goes here...</p>
        <p>You can put forms, settings, or any content here.</p>
      </Drawer>

      {/* Modal */}
      <Modal
        title="Basic Modal"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p>Modal content goes here...</p>
      </Modal>

      {/* Tooltip and Popover */}
      <div style={{ marginBottom: 24 }}>
        <Tooltip title="This is a tooltip">
          <span style={{ marginRight: 16, cursor: 'pointer', color: '#1890ff' }}>
            Hover me (Tooltip)
          </span>
        </Tooltip>

        <Popover content="This is popover content" title="Popover Title">
          <span style={{ cursor: 'pointer', color: '#1890ff' }}>
            Click me (Popover)
          </span>
        </Popover>
      </div>

      <Divider />

      {/* Tabs */}
      <div style={{ marginBottom: 24 }}>
        <h3>Tabs</h3>
        <Tabs defaultActiveKey="1" items={items} />
      </div>

      {/* Collapse */}
      <div>
        <h3>Collapse</h3>
        <Collapse items={collapseItems} defaultActiveKey={['1']} />
      </div>
    </div>
  )
}