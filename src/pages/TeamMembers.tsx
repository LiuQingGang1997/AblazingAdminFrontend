import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Typography, message, Switch } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { ImageUpload } from '../components/Upload'

const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchMembers = async () => {
    try {
      const res = await http.get('/api/team-members')
      if (Array.isArray(res.data)) {
        setMembers(res.data)
      } else {
        setMembers([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限访问团队成员管理')
      } else {
        message.error('获取团队成员列表失败')
      }
      setMembers([])
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      nickname: record.nickname,
      title: record.title,
      position: record.position,
      photoUrl: record.photoUrl,
      email: record.email,
      phone: record.phone,
      department: record.department,
      description: record.description,
      enabled: record.enabled,
      sortOrder: record.sortOrder,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/team-members/${editing.id}`, values)
        message.success('已更新团队成员')
      } else {
        await http.post('/api/team-members', values)
        message.success('已创建团队成员')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchMembers()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/api/team-members/${id}`)
      message.success('已删除团队成员')
      fetchMembers()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作')
      } else {
        message.error('删除失败')
      }
    }
  }

  const columns = useMemo(() => [
    {
      title: '照片',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      width: 80,
      render: (url: string) => (
        <img
          src={url}
          alt=""
          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/%3E%3Ccircle cx="12" cy="7" r="4"/%3E%3C/svg%3E'
          }}
        />
      ),
    },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Switch checked={enabled} disabled />
      ),
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该成员？"
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
  ], [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          团队成员管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建成员
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 14 }}>
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? '编辑团队成员' : '新建团队成员'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        width={520}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item name="title" label="职称">
            <Input placeholder="请输入职称" />
          </Form.Item>

          <Form.Item name="position" label="职位">
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item name="department" label="部门">
            <Input placeholder="请输入部门" />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input type="email" placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item name="photoUrl" label="照片链接">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="description" label="个人简介">
            <Input.TextArea rows={3} placeholder="请输入个人简介" />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序权重" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item name="enabled" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TeamMembers
