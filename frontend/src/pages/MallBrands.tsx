import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Switch, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload, FileUpload } from '../components/Upload'

const MallBrands: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN')
  const [brands, setBrands] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  
  // WangEditor instance
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  
  // Destroy editor when unmounting
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])
  
  const toolbarConfig: Partial<IToolbarConfig> = {}
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '<h2>品牌历史</h2><p>...</p>',
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

  const fetchBrands = async () => {
    try {
      const res = await http.get('/api/mall-brands')
      if (Array.isArray(res.data)) {
        setBrands(res.data)
      } else {
        setBrands([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取商城入驻品牌列表失败')
      setBrands([])
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const openCreate = () => {
    setEditor(null)
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ enabled: true, sortOrder: 0 })
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditor(null)
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      logoUrl: record.logoUrl,
      slogan: record.slogan,
      introduction: record.introduction,
      promoImageUrl: record.promoImageUrl,
      promoVideoUrl: record.promoVideoUrl,
      mobilePromoVideoUrl: record.mobilePromoVideoUrl,
      mobilePromoImageUrl: record.mobilePromoImageUrl,
      detailDescription: record.detailDescription,
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
        await http.put(`/api/mall-brands/${editing.id}`, values)
        message.success('已更新商城入驻品牌')
      } else {
        await http.post('/api/mall-brands', values)
        message.success('已创建商城入驻品牌')
      }
      setIsModalOpen(false)
      setEditor(null)
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
      await http.delete(`/api/mall-brands/${id}`)
      message.success('已删除商城入驻品牌')
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
      { title: 'Slogan', dataIndex: 'slogan', key: 'slogan' },
      { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
      { 
        title: '状态', 
        dataIndex: 'enabled', 
        key: 'enabled',
        width: 80,
        render: (enabled: boolean) => enabled ? <Typography.Text type="success">已启用</Typography.Text> : <Typography.Text type="danger">已禁用</Typography.Text>
      },
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
              title="确认删除该入驻品牌？"
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
          商城入驻品牌管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建入驻品牌
          </Button>
        ) : null}
      </div>

      <Table dataSource={brands} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑入驻品牌' : '新建入驻品牌'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false)
          setEditor(null)
          setEditing(null)
        }}
        width={900}
        destroyOnClose>
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="name" label="品牌名称" rules={[{ required: true, message: '请输入品牌名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="logoUrl" label="Logo 图片链接" rules={[{ required: true, message: '请输入Logo链接' }]}>
              <ImageUpload />
            </Form.Item>
            <Form.Item name="slogan" label="品牌 Slogan">
              <Input />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序值" tooltip="数值越小越靠前">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="introduction" label="品牌简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="promoVideoUrl" label="宣传视频链接 (PC端)">
              <FileUpload accept="video/*" />
            </Form.Item>
            <Form.Item name="mobilePromoVideoUrl" label="宣传视频链接 (移动端)">
              <FileUpload accept="video/*" />
            </Form.Item>
          </div>

          <Form.Item name="promoImageUrl" label="宣传图链接 (PC端)">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="mobilePromoImageUrl" label="宣传图链接 (移动端)" tooltip="建议针对移动端优化，如 750x1334 或类似比例">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="detailDescription" label="详细描述 (HTML)">
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
              <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode="default"
                style={{ borderBottom: '1px solid #ccc' }}
              />
              <Editor
                defaultConfig={editorConfig}
                value={form.getFieldValue('detailDescription') || ''}
                onCreated={setEditor}
                onChange={editor => {
                  form.setFieldsValue({ detailDescription: editor.getHtml() });
                }}
                mode="default"
                style={{ height: '300px', overflowY: 'hidden' }}
              />
            </div>
          </Form.Item>

          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MallBrands
