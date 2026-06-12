import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload } from '../components/Upload'

const CustomerReviews: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN')
  const [reviews, setReviews] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchReviews = async () => {
    try {
      const res = await http.get('/api/customer-reviews')
      if (Array.isArray(res.data)) {
        setReviews(res.data)
      } else {
        setReviews([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取评价列表失败')
      setReviews([])
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      content: record.content,
      avatarUrl: record.avatarUrl,
      companyName: record.companyName,
      position: record.position,
      customerName: record.customerName,
      reviewDate: record.reviewDate,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/customer-reviews/${editing.id}`, values)
        message.success('已更新评价')
      } else {
        await http.post('/api/customer-reviews', values)
        message.success('已创建评价')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchReviews()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作，需要 ADMIN 权限')
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/api/customer-reviews/${id}`)
      message.success('已删除评价')
      fetchReviews()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作，需要 ADMIN 权限')
      } else {
        message.error('删除失败')
      }
    }
  }

  const columns = useMemo(() => {
    const cols: any[] = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
      { 
        title: '头像', 
        dataIndex: 'avatarUrl', 
        key: 'avatarUrl',
        render: (url: string) => url ? <Image src={url} alt="avatar" style={{ maxHeight: 40, maxWidth: 40, objectFit: 'cover', borderRadius: '50%' }} /> : '-'
      },
      { title: '客户姓名', dataIndex: 'customerName', key: 'customerName' },
      { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
      { title: '职位', dataIndex: 'position', key: 'position' },
      { title: '评价日期', dataIndex: 'reviewDate', key: 'reviewDate' },
      { title: '评价内容', dataIndex: 'content', key: 'content', ellipsis: true },
    ]
    if (canWrite) {
      cols.push({
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <Space>
            <Button type="link" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认删除该评价？"
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
      })
    }
    return cols
  }, [canWrite])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          客户评价管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建评价
          </Button>
        ) : null}
      </div>

      <Table dataSource={reviews} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑客户评价' : '新建客户评价'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerName" label="客户姓名" rules={[{ required: true, message: '请输入客户姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input />
          </Form.Item>
          <Form.Item name="reviewDate" label="评价日期" rules={[{ required: true, message: '请输入评价日期 (如：2023年10月)' }]}>
            <Input placeholder="如：2023年10月" />
          </Form.Item>
          <Form.Item name="avatarUrl" label="客户头像" rules={[{ required: true, message: '请输入头像链接' }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="content" label="评价内容" rules={[{ required: true, message: '请输入评价内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CustomerReviews
