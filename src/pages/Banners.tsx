import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload } from '../components/Upload'

const Banners: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN', 'EDITOR')
  const [banners, setBanners] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchBanners = async () => {
    try {
      const res = await http.get('/api/banners')
      if (Array.isArray(res.data)) {
        setBanners(res.data)
      } else {
        setBanners([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取 Banner 列表失败')
      setBanners([])
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, priority: 0 })
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      imageUrl: record.imageUrl,
      linkUrl: record.linkUrl,
      modifier: record.modifier,
      enabled: record.enabled,
      priority: record.priority,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/banners/${editing.id}`, values)
        message.success('已更新 Banner')
      } else {
        await http.post('/api/banners', values)
        message.success('已创建 Banner')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchBanners()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作')
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await http.delete(`/api/banners/${id}`)
      message.success('已删除 Banner')
      fetchBanners()
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
      { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
      { 
        title: '图片', 
        dataIndex: 'imageUrl', 
        key: 'imageUrl',
        render: (url: string) => url ? <Image src={url} alt="banner" style={{ maxHeight: 60, maxWidth: 100, objectFit: 'contain' }} /> : '-'
      },
      { title: '跳转链接', dataIndex: 'linkUrl', key: 'linkUrl', ellipsis: true },
      { title: '优先级', dataIndex: 'priority', key: 'priority' },
      { 
        title: '状态', 
        dataIndex: 'enabled', 
        key: 'enabled',
        render: (enabled: boolean) => enabled ? <span style={{ color: 'green' }}>启用</span> : <span style={{ color: 'red' }}>禁用</span>
      },
      { title: '修改人', dataIndex: 'modifier', key: 'modifier' },
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
              title="确认删除该 Banner？"
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
          首页 Banner 管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建 Banner
          </Button>
        ) : null}
      </div>

      <Table dataSource={banners} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑 Banner' : '新建 Banner'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="Banner 图片链接" rules={[{ required: true, message: '请输入图片链接' }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="https://example.com/jump" />
          </Form.Item>
          <Form.Item name="modifier" label="修改人">
            <Input placeholder="输入修改人信息" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请输入优先级' }]} tooltip="数值越大的排在越前面">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Banners
