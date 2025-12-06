import { Table, Button, Space, Tag, Avatar, Popconfirm, Modal, Form, Input } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../store/api'
import { logger } from '../utils/logger'

interface User {
  id: string
  name: string
  email: string
  created_at: string
  settings?: { [key: string]: unknown }
  role?: string
  status?: 'active' | 'inactive'
  avatar?: string
  key?: string
}

export const UserTable = () => {
  const { data: users, isLoading, error } = useGetUsersQuery(undefined)
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const dataSource = users?.data?.users?.map((user: { id: string; name: string; email: string; created_at: string; settings?: { [key: string]: unknown } }) => ({
    ...user,
    key: user.id,
    role: (user.settings?.role as string) || 'User',
    status: 'active' as 'active' | 'inactive',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
  })) || []

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading users</div>

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    logger.info('Delete user initiated', { userId: id })
    try {
      const result = await deleteUser(id).unwrap()
      logger.info('User deleted successfully', { userId: id, result })
    } catch (error) {
      logger.error('Failed to delete user', { userId: id, error })
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      logger.info('Save user initiated', { isEditing: !!editingUser, userId: editingUser?.id, values })
      if (editingUser) {
        const result = await updateUser({ id: editingUser.id, name: values.name, email: values.email, settings: { role: values.role } }).unwrap()
        logger.info('User updated successfully', { userId: editingUser.id, result })
      } else {
        const result = await createUser({ name: values.name, email: values.email, settings: { role: values.role } }).unwrap()
        logger.info('User created successfully', { result })
      }
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      logger.error('Failed to save user', { isEditing: !!editingUser, userId: editingUser?.id, error })
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }
  const columns: ColumnsType<User> = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      responsive: ['md'],
      render: (avatar) => <Avatar src={avatar} />
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md']
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' },
        { text: 'Moderator', value: 'Moderator' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isMobile = window.innerWidth < 768
        return (
          <Space size="middle">
            <Button type="link" icon={<EyeOutlined />} size="small">
              {isMobile ? '' : 'View'}
            </Button>
            <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
              {isMobile ? '' : 'Edit'}
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => record.key && handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                {isMobile ? '' : 'Delete'}
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add User
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 800 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
      />
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}