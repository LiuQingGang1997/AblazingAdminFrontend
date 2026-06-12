import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload, FileUpload } from '../components/Upload'

const ProductScenes: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN')
  const [scenes, setScenes] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchScenes = async () => {
    try {
      const res = await http.get('/api/product-scenes')
      if (Array.isArray(res.data)) {
        setScenes(res.data)
      } else {
        setScenes([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取产品场景列表失败')
      setScenes([])
    }
  }

  useEffect(() => {
    fetchScenes()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, sortOrder: 0 })
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      englishName: record.englishName,
      imageUrl: record.imageUrl,
      videoUrl: record.videoUrl,
      enabled: record.enabled ?? true,
      sortOrder: record.sortOrder ?? 0,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/product-scenes/${editing.id}`, values)
        message.success('已更新产品场景')
      } else {
        await http.post('/api/product-scenes', values)
        message.success('已创建产品场景')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchScenes()
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
      await http.delete(`/api/product-scenes/${id}`)
      message.success('已删除产品场景')
      fetchScenes()
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
        title: '场景图片', 
        dataIndex: 'imageUrl', 
        key: 'imageUrl',
        render: (url: string) => url ? <Image src={url} alt="scene" style={{ maxHeight: 50, maxWidth: 80, objectFit: 'contain' }} /> : '-'
      },
      { title: '场景名称', dataIndex: 'name', key: 'name' },
      { title: '英文名称', dataIndex: 'englishName', key: 'englishName' },
      { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
      { 
        title: '状态', 
        dataIndex: 'enabled', 
        key: 'enabled',
        width: 80,
        render: (enabled: boolean) => enabled ? <Typography.Text type="success">已启用</Typography.Text> : <Typography.Text type="danger">已禁用</Typography.Text>
      },
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
              title="确认删除该产品场景？"
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
          产品场景管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建场景
          </Button>
        ) : null}
      </div>

      <Table dataSource={scenes} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑产品场景' : '新建产品场景'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="场景名称" rules={[{ required: true, message: '请输入场景名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="englishName" label="英文名称">
            <Input />
          </Form.Item>
          <Form.Item name="imageUrl" label="场景图片链接" rules={[{ required: true, message: '请输入图片链接' }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="videoUrl" label="场景视频链接">
            <FileUpload accept="video/*" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="sortOrder" label="排序值" tooltip="数值越小越靠前">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="enabled" label="是否启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductScenes
