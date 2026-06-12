import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload } from '../components/Upload'

const ProductSeries: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN', 'EDITOR')
  const [series, setSeries] = useState<any[]>([])
  const [mallBrands, setMallBrands] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      const [seriesRes, brandsRes] = await Promise.all([
        http.get('/api/product-series'),
        http.get('/api/mall-brands'),
      ])
      if (Array.isArray(seriesRes.data)) setSeries(seriesRes.data)
      if (Array.isArray(brandsRes.data)) setMallBrands(brandsRes.data)
    } catch (error) {
      message.error('获取数据失败')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, sortOrder: 0 })
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    const brandId = record.brandId ?? record.brand_id ?? record.BrandId
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      brandId,
      coverImageUrl: record.coverImageUrl,
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
        await http.put(`/api/product-series/${editing.id}`, values)
        message.success('已更新产品系列')
      } else {
        await http.post('/api/product-series', values)
        message.success('已创建产品系列')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchData()
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
      await http.delete(`/api/product-series/${id}`)
      message.success('已删除产品系列')
      fetchData()
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
        title: '封面图', 
        dataIndex: 'coverImageUrl', 
        key: 'coverImageUrl',
        render: (url: string) => url ? <Image src={url} alt="cover" style={{ maxHeight: 50, maxWidth: 80, objectFit: 'contain' }} /> : '-'
      },
      { title: '系列名称', dataIndex: 'name', key: 'name' },
      { title: '系列描述', dataIndex: 'description', key: 'description', ellipsis: true },
      { 
        title: '所属品牌', 
        dataIndex: 'brandName', 
        key: 'brandName',
        render: (name: string) => name || '-'
      },
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
              title="确认删除该产品系列？"
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
          产品系列管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建系列
          </Button>
        ) : null}
      </div>

      <Table dataSource={series} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑产品系列' : '新建产品系列'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="系列名称" rules={[{ required: true, message: '请输入系列名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="系列描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="brandId" label="所属品牌">
            <Select 
              allowClear 
              placeholder="选择品牌" 
              options={mallBrands.map(b => ({ label: b.name, value: b.id }))} 
            />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="系列封面图">
            <ImageUpload />
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

export default ProductSeries