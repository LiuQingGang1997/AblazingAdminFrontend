import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload } from '../components/Upload'

const Brands: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN')
  const [brands, setBrands] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchBrands = async () => {
    try {
      const res = await http.get('/api/brands')
      if (Array.isArray(res.data)) {
        setBrands(res.data)
      } else {
        setBrands([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取品牌列表失败')
      setBrands([])
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ sortOrder: 0 })
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      logoUrl: record.logoUrl,
      sortOrder: record.sortOrder,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/brands/${editing.id}`, values)
        message.success('已更新品牌')
      } else {
        await http.post('/api/brands', values)
        message.success('已创建品牌')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchBrands()
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
      await http.delete(`/api/brands/${id}`)
      message.success('已删除品牌')
      fetchBrands()
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
        title: 'Logo', 
        dataIndex: 'logoUrl', 
        key: 'logoUrl',
        render: (url: string) => url ? <Image src={url} alt="logo" style={{ maxHeight: 40, maxWidth: 100, objectFit: 'contain' }} /> : '-'
      },
      { title: '品牌名称', dataIndex: 'name', key: 'name' },
      { title: '排序序号', dataIndex: 'sortOrder', key: 'sortOrder' },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
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
              title="确认删除该品牌？"
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
          品牌墙管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建品牌
          </Button>
        ) : null}
      </div>

      <Table dataSource={brands} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑品牌' : '新建品牌'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true, message: '请输入品牌名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo 图片链接" rules={[{ required: true, message: '请输入Logo链接' }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号" tooltip="序号越小排序越前">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Brands
