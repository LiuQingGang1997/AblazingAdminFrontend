import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image, Select, Tag, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'

import { ImageUpload, MultiImageUpload } from '../components/Upload'

const Products: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN', 'EDITOR')
  const [products, setProducts] = useState<any[]>([])
  
  // Dropdown data
  const [mallBrands, setMallBrands] = useState<any[]>([])
  const [productScenes, setProductScenes] = useState<any[]>([])
  const [productTypes, setProductTypes] = useState<any[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // WangEditor state
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState('')

  const toolbarConfig: Partial<IToolbarConfig> = {}
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入产品详情富文本...',
    MENU_CONF: {
      uploadImage: {
        server: '/api/upload',
        fieldName: 'file',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        customInsert(res: any, insertFn: any) {
          if (res.code === 200 && res.data) {
            insertFn(res.data, res.data, res.data)
          }
        },
      },
      uploadVideo: {
        server: '/api/upload',
        fieldName: 'file',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        customInsert(res: any, insertFn: any) {
          if (res.code === 200 && res.data) {
            insertFn(res.data, res.data)
          }
        },
      },
    },
  }

  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  const handleModalCancel = () => {
    setIsModalOpen(false)
    setEditor(null)
    setEditing(null)
    setHtml('')
  }

  const fetchDropdownData = async () => {
    try {
      const [brandsRes, scenesRes, typesRes] = await Promise.all([
        http.get('/api/mall-brands'),
        http.get('/api/product-scenes'),
        http.get('/api/product-types'),
      ])
      if (Array.isArray(brandsRes.data)) setMallBrands(brandsRes.data)
      if (Array.isArray(scenesRes.data)) setProductScenes(scenesRes.data)
      if (Array.isArray(typesRes.data)) setProductTypes(typesRes.data)
    } catch (error) {
      console.error('Failed to fetch dropdown data', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await http.get('/api/products')
      if (Array.isArray(res.data)) {
        setProducts(res.data)
      } else {
        setProducts([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取产品列表失败')
      setProducts([])
    }
  }

  useEffect(() => {
    fetchDropdownData()
    fetchProducts()
  }, [])

  const openCreate = () => {
    setEditor(null)
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, sortOrder: 0 })
    setHtml('')
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditor(null)
    setEditing(record)
    
    // Transform parameters object back to array for Form.List
    const paramsArray = record.parameters ? Object.entries(record.parameters).map(([key, value]) => ({ key, value })) : []
    
    form.setFieldsValue({
      name: record.name,
      model: record.model,
      summary: record.summary,
      price: record.price,
      coverImageUrl: record.coverImageUrl,
      brandId: record.brandId,
      sceneId: record.sceneId,
      typeId: record.typeId,
      detailImages: record.detailImages,
      parameters: paramsArray,
      enabled: record.enabled ?? true,
      sortOrder: record.sortOrder ?? 0,
    })
    setHtml(record.detailDescription || '')
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const payload = {
        ...values,
        detailDescription: html,
      }

      // Transform parameters array back to object
      if (payload.parameters && Array.isArray(payload.parameters)) {
        const paramsObj: Record<string, string> = {}
        payload.parameters.forEach((item: any) => {
          if (item && item.key && item.value) {
            paramsObj[item.key] = item.value
          }
        })
        payload.parameters = paramsObj
      }

      if (editing?.id) {
        await http.put(`/api/products/${editing.id}`, payload)
        message.success('已更新产品')
      } else {
        await http.post('/api/products', payload)
        message.success('已创建产品')
      }
      setIsModalOpen(false)
      setEditor(null)
      form.resetFields()
      setHtml('')
      setEditing(null)
      fetchProducts()
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
      await http.delete(`/api/products/${id}`)
      message.success('已删除产品')
      fetchProducts()
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
        title: '封面', 
        dataIndex: 'coverImageUrl', 
        key: 'coverImageUrl',
        render: (url: string) => url ? <Image src={url} alt="cover" style={{ maxHeight: 40, maxWidth: 60, objectFit: 'contain' }} /> : '-'
      },
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '型号', dataIndex: 'model', key: 'model' },
      { 
        title: '简介', 
        dataIndex: 'summary', 
        key: 'summary',
        ellipsis: true,
        width: 150,
      },
      { 
        title: '归属信息', 
        key: 'associations',
        render: (_: any, record: any) => (
          <Space direction="vertical" size={0}>
            {record.brandName && <Typography.Text type="secondary" style={{ fontSize: 12 }}>品牌: {record.brandName}</Typography.Text>}
            {record.sceneName && <Typography.Text type="secondary" style={{ fontSize: 12 }}>场景: {record.sceneName}</Typography.Text>}
            {record.typeName && <Typography.Text type="secondary" style={{ fontSize: 12 }}>类型: {record.typeName}</Typography.Text>}
          </Space>
        )
      },
      { 
        title: '价格', 
        dataIndex: 'price', 
        key: 'price',
        render: (price: number) => price != null ? `¥${price.toFixed(2)}` : '-'
      },
      { 
        title: '状态', 
        dataIndex: 'enabled', 
        key: 'enabled',
        width: 80,
        render: (enabled: boolean) => enabled ? <Typography.Text type="success">已上架</Typography.Text> : <Typography.Text type="danger">已下架</Typography.Text>
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
              title="确认删除该产品？(将会级联删除关联的详情图和参数数据)"
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
          产品管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建产品
          </Button>
        ) : null}
      </div>

      <Table dataSource={products} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />

      <Modal
        title={editing ? '编辑产品' : '新建产品'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={handleModalCancel}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="model" label="产品型号">
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="summary" label="产品简介" rules={[{ max: 1024, message: '简介最大1024字符' }]}>
            <Input.TextArea rows={2} showCount maxLength={1024} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="brandId" label="归属品牌">
              <Select allowClear placeholder="选择品牌" options={mallBrands.map(b => ({ label: b.name, value: b.id }))} />
            </Form.Item>
            <Form.Item name="sceneId" label="归属场景">
              <Select allowClear placeholder="选择场景" options={productScenes.map(s => ({ label: s.name, value: s.id }))} />
            </Form.Item>
            <Form.Item name="typeId" label="归属类型">
              <Select allowClear placeholder="选择类型" options={productTypes.map(t => ({ label: t.name, value: t.id }))} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="price" label="价格">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
            </Form.Item>
            <Form.Item name="coverImageUrl" label="封面图片链接">
              <ImageUpload />
            </Form.Item>
          </div>

          <Form.Item name="detailImages" label="多张详情图">
            <MultiImageUpload />
          </Form.Item>

          <Form.Item label="详细配置参数 (Key-Value)">
            <Form.List name="parameters">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, message: '缺失键' }]}
                      >
                        <Input placeholder="参数名 (如: 颜色)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: '缺失值' }]}
                      >
                        <Input placeholder="参数值 (如: 星空黑)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加参数
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="详情富文本">
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
              <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode="default"
                style={{ borderBottom: '1px solid #ccc' }}
              />
              <Editor
                defaultConfig={editorConfig}
                value={html}
                onCreated={setEditor}
                onChange={editor => setHtml(editor.getHtml())}
                mode="default"
                style={{ height: '300px', overflowY: 'hidden' }}
              />
            </div>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="sortOrder" label="排序值" tooltip="数值越小越靠前">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="enabled" label="是否上架" valuePropName="checked">
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Products
