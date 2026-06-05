import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload } from '../components/Upload'

const ProductTypes: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN')
  const [productTypes, setProductTypes] = useState<any[]>([])
  const [mallBrands, setMallBrands] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterBrandId, setFilterBrandId] = useState<number | undefined>(undefined)
  const [form] = Form.useForm()

  const fetchMallBrands = async () => {
    try {
      const res = await http.get('/api/mall-brands')
      if (Array.isArray(res.data)) {
        setMallBrands(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch mall brands', error)
    }
  }

  const fetchProductTypes = async (brandId?: number) => {
    try {
      const url = brandId ? `/api/product-types/brand/${brandId}` : '/api/product-types'
      const res = await http.get(url)
      if (Array.isArray(res.data)) {
        setProductTypes(res.data)
      } else {
        setProductTypes([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取产品类型列表失败')
      setProductTypes([])
    }
  }

  useEffect(() => {
    fetchMallBrands()
  }, [])

  useEffect(() => {
    fetchProductTypes(filterBrandId)
  }, [filterBrandId])

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
      brandId: record.brandId,
      imageUrl: record.imageUrl,
      description: record.description,
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
        await http.put(`/api/product-types/${editing.id}`, values)
        message.success('已更新产品类型')
      } else {
        await http.post('/api/product-types', values)
        message.success('已创建产品类型')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchProductTypes(filterBrandId)
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
      await http.delete(`/api/product-types/${id}`)
      message.success('已删除产品类型')
      fetchProductTypes(filterBrandId)
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
        title: '图片', 
        dataIndex: 'imageUrl', 
        key: 'imageUrl',
        render: (url: string) => url ? <Image src={url} alt="image" style={{ maxHeight: 40, maxWidth: 60, objectFit: 'contain' }} /> : '-'
      },
      { title: '类型名称', dataIndex: 'name', key: 'name' },
      { 
        title: '归属品牌', 
        dataIndex: 'brandId', 
        key: 'brandId',
        render: (brandId: number) => {
          const brand = mallBrands.find(b => b.id === brandId)
          return brand ? brand.name : brandId
        }
      },
      { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
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
              title="确认删除该产品类型？"
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
  }, [canWrite, mallBrands])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          产品类型管理
        </Typography.Title>
        <Space>
          <Select
            allowClear
            placeholder="按品牌筛选"
            style={{ width: 200 }}
            value={filterBrandId}
            onChange={setFilterBrandId}
            options={mallBrands.map(b => ({ label: b.name, value: b.id }))}
          />
          {canWrite ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建产品类型
            </Button>
          ) : null}
        </Space>
      </div>

      <Table dataSource={productTypes} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑产品类型' : '新建产品类型'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="类型名称" rules={[{ required: true, message: '请输入类型名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brandId" label="归属品牌" rules={[{ required: true, message: '请选择归属品牌' }]}>
            <Select
              placeholder="请选择归属的商城品牌"
              options={mallBrands.map(b => ({ label: b.name, value: b.id }))}
            />
          </Form.Item>
          <Form.Item name="imageUrl" label="类型图片链接">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
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

export default ProductTypes
