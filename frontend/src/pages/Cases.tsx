import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, DatePicker, Select, Modal, Popconfirm, Space, Table, Typography, message, Image } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'
import { ImageUpload, MultiImageUpload } from '../components/Upload'

const Cases: React.FC = () => {
  const { hasRole } = useAuth()
  const canWrite = hasRole('ADMIN', 'EDITOR')
  const [cases, setCases] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchCases = async () => {
    try {
      const res = await http.get('/api/cases')
      if (Array.isArray(res.data)) {
        setCases(res.data)
      } else {
        setCases([])
        message.error('未连接到后端服务')
      }
    } catch (error) {
      message.error('获取案例列表失败')
      setCases([])
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    
    // Transform features object to array for Form.List
    const featuresArr = record.features ? Object.keys(record.features).map(k => ({
      key: k,
      label: record.features[k]?.label,
      value: record.features[k]?.value
    })) : []

    form.setFieldsValue({
      name: record.name,
      address: record.address,
      completionTime: record.completionTime ? dayjs(record.completionTime) : null,
      coverImage: record.coverImage,
      detailImages: record.detailImages || [],
      titleDescription: record.titleDescription,
      featuresArr
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Transform featuresArr back to object
      const featuresObj: Record<string, any> = {}
      if (values.featuresArr) {
        values.featuresArr.forEach((item: any) => {
          if (item && item.key) {
            featuresObj[item.key] = { label: item.label, value: item.value }
          }
        })
      }
      
      const payload = {
        name: values.name,
        address: values.address,
        completionTime: values.completionTime ? values.completionTime.format('YYYY-MM-DD') : null,
        coverImage: values.coverImage,
        detailImages: values.detailImages || [],
        titleDescription: values.titleDescription,
        features: featuresObj
      }

      if (editing?.id) {
        await http.put(`/api/cases/${editing.id}`, payload)
        message.success('已更新案例')
      } else {
        await http.post('/api/cases', payload)
        message.success('已创建案例')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditing(null)
      fetchCases()
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
      await http.delete(`/api/cases/${id}`)
      message.success('已删除案例')
      fetchCases()
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
        dataIndex: 'coverImage', 
        key: 'coverImage',
        render: (url: string) => url ? <Image src={url} alt="cover" style={{ maxHeight: 60, maxWidth: 100, objectFit: 'contain' }} /> : '-'
      },
      { title: '案例名称', dataIndex: 'name', key: 'name' },
      { title: '标题介绍', dataIndex: 'titleDescription', key: 'titleDescription', ellipsis: true },
      { title: '地址', dataIndex: 'address', key: 'address' },
      { title: '完工时间', dataIndex: 'completionTime', key: 'completionTime' },
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
              title="确认删除该案例？"
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
          案例管理
        </Typography.Title>
        {canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建案例
          </Button>
        ) : null}
      </div>

      <Table dataSource={cases} columns={columns} rowKey="id" />

      <Modal
        title={editing ? '编辑案例' : '新建案例'}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={loading}
        width={700}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="案例名称" rules={[{ required: true, message: '请输入案例名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="titleDescription" label="标题介绍">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="completionTime" label="完工时间">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="coverImage" label="封面图片" rules={[{ required: true, message: '请输入封面图片链接' }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="detailImages" label="详情图片">
            <MultiImageUpload />
          </Form.Item>

          <Form.List name="featuresArr">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8 }}><strong>特色属性 (Features)</strong></div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[{ required: true, message: '请输入键' }]}
                    >
                      <Input placeholder="键 (如 item1)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'label']}
                      rules={[{ required: true, message: '请输入标签' }]}
                    >
                      <Input placeholder="标签 (如 新特色)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: '请输入值' }]}
                    >
                      <Input placeholder="值 (如 描述信息)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加特色属性
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  )
}

export default Cases
