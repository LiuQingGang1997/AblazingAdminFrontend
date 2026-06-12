import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message, InputNumber, TreeSelect } from 'antd'
import { PlusOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { http } from '../services/http'



const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [treeData, setTreeData] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchCategories = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        http.get('/api/categories'),
        http.get('/api/mall-brands'),
      ])
      if (Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data)
        buildTreeData(categoriesRes.data)
      }
      if (Array.isArray(brandsRes.data)) {
        setBrands(brandsRes.data)
      }
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限访问分类管理')
      } else {
        message.error('获取分类列表失败')
      }
      setCategories([])
    }
  }

  const buildTreeData = (data: any[]) => {
    const map: Record<number, any[]> = {}
    data.forEach(item => {
      const parentId = item.parentId || 0
      if (!map[parentId]) map[parentId] = []
      map[parentId].push(item)
    })
    
    const buildTree = (parentId: number): any[] => {
      return (map[parentId] || []).map(item => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: buildTree(item.id),
      }))
    }
    
    setTreeData(buildTree(0))
  }

  useEffect(() => {
    fetchCategories()
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
      parentId: record.parentId || 0,
      brandId: record.brandId,
      sort: record.sort,
      status: record.status,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editing?.id) {
        await http.put(`/api/categories/${editing.id}`, values)
        message.success('已更新分类')
      } else {
        await http.post('/api/categories', values)
        message.success('已创建分类')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchCategories()
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
      await http.delete(`/api/categories/${id}`)
      message.success('已删除分类')
      fetchCategories()
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        message.error('无权限执行该操作')
      } else {
        message.error('删除失败，该分类下可能存在子分类或关联产品')
      }
    }
  }

  const getLevelName = (level: number) => {
    const names = ['', '一级分类', '二级分类', '三级分类']
    return names[level] || `第${level}级分类`
  }

  const getStatusText = (status: number) => {
    return status === 1 ? '启用' : '禁用'
  }

  const getStatusColor = (status: number) => {
    return status === 1 ? 'green' : 'red'
  }

  const columns = useMemo(() => [
    {
      title: '图标',
      dataIndex: 'id',
      key: 'icon',
      width: 60,
      render: () => <FolderOpenOutlined style={{ fontSize: 20, color: '#6366f1' }} />,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => {
        const indent = '└'.repeat(record.level - 1)
        return <span>{indent}{name}</span>
      },
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: number) => <span className="text-gray-500">{getLevelName(level)}</span>,
    },
    {
      title: '父级分类',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      render: (parentId: number) => {
        if (!parentId) return <span className="text-gray-400">根分类</span>
        const parent = categories.find(c => c.id === parentId)
        return parent?.name || '未知'
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '关联品牌',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 120,
      render: (brandName: string) => brandName || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <span style={{ color: getStatusColor(status) }}>{getStatusText(status)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该分类？"
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
  ], [categories])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          分类管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建分类
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 14 }}>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? '编辑分类' : '新建分类'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        width={480}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item name="parentId" label="父级分类">
            <TreeSelect
              treeData={treeData}
              placeholder="选择父级分类（不选为根分类）"
              style={{ width: '100%' }}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item name="sort" label="排序值" initialValue={0}>
            <InputNumber placeholder="数字越小越靠前" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="brandId" label="关联品牌">
            <Select allowClear placeholder="选择关联的商城品牌" options={brands.map(b => ({ label: b.name, value: b.id }))} />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Categories
