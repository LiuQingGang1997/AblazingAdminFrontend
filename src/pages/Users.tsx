import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'

const Users: React.FC = () => {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')
  const [users, setUsers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    try {
      const res = await http.get('/api/users')
      if (Array.isArray(res.data)) {
        setUsers(res.data)
      } else {
        setUsers([])
        message.error('未连接到后端服务，请确认 Java 后端已启动')
      }
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限访问用户管理')
      } else {
        message.error('Failed to fetch users')
      }
      setUsers([])
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      email: record.email,
      role: record.role,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/users/${editing.id}`, values)
        message.success('已更新用户')
      } else {
        await http.post('/api/users', values)
        message.success('已创建用户')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchUsers()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 409) {
        message.error('用户名已存在')
      } else if (status === 403) {
        message.error('无权限执行该操作')
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/api/users/${id}`)
      message.success('已删除用户')
      fetchUsers()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作')
      } else {
        message.error('删除失败')
      }
    }
  }

  const columns = useMemo(() => {
    const cols: any[] = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
    ]
    return cols
  }, [])

  if (!isAdmin) {
    return (
      <Card bordered={false} style={{ borderRadius: 14 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          无权限
        </Typography.Title>
        <Typography.Text type="secondary">只有 ADMIN 可以访问用户管理。</Typography.Text>
      </Card>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          用户管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建用户
        </Button>
      </div>

      <Table dataSource={users} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          {editing ? null : (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          {editing ? (
            <Form.Item name="password" label="重置密码（可选）">
              <Input.Password />
            </Form.Item>
          ) : null}
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'EDITOR', label: 'EDITOR' },
                { value: 'VIEWER', label: 'VIEWER' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Users
