import React, { useEffect, useState } from 'react'
import { Upload, Button, App } from 'antd'
import type { UploadProps } from 'antd'
import { UploadOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons'

export const ImageUpload: React.FC<{ value?: string; onChange?: (val: string) => void }> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false)
  const { message: appMessage } = App.useApp()
  
  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      setLoading(false)
      const url = info.file.response?.data || info.file.response
      onChange?.(url)
      appMessage.success('上传成功')
    } else if (info.file.status === 'error') {
      setLoading(false)
      appMessage.error('上传失败')
    }
  }
  return (
    <Upload
      name="file"
      action="/api/upload"
      headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
      showUploadList={false}
      accept="image/*"
      onChange={handleChange}
    >
      {value ? (
        <img src={value} alt="preview" style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }} />
      ) : (
        <Button loading={loading} icon={<UploadOutlined />}>上传图片</Button>
      )}
    </Upload>
  )
}

export const MultiImageUpload: React.FC<{ value?: string[]; onChange?: (val: string[]) => void }> = ({ value, onChange }) => {
  const [fileList, setFileList] = useState<any[]>([])
  const { message: appMessage } = App.useApp()

  useEffect(() => {
    const urls = value || []
    setFileList(urls.map((url, i) => ({
      uid: String(i),
      name: `image-${i}`,
      status: 'done',
      url,
    })))
  }, [value])

  const handleChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList)
    if (info.file.status === 'done') {
      appMessage.success('上传成功')
      const urls = info.fileList.map(f => f.url || f.response?.data || f.response).filter(Boolean)
      onChange?.(urls)
    } else if (info.file.status === 'removed') {
      const urls = info.fileList.map(f => f.url || f.response?.data || f.response).filter(Boolean)
      onChange?.(urls)
    } else if (info.file.status === 'error') {
      appMessage.error('上传失败')
    }
  }

  return (
    <Upload
      name="file"
      action="/api/upload"
      headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
      listType="picture-card"
      accept="image/*"
      fileList={fileList}
      onChange={handleChange}
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>上传图片</div>
      </div>
    </Upload>
  )
}

export const FileUpload: React.FC<{ value?: string; onChange?: (val: string) => void; accept?: string }> = ({ value, onChange, accept }) => {
  const [loading, setLoading] = useState(false)
  const { message: appMessage } = App.useApp()
  
  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      setLoading(false)
      const url = info.file.response?.data || info.file.response
      onChange?.(url)
      appMessage.success('上传成功')
    } else if (info.file.status === 'error') {
      setLoading(false)
      appMessage.error('上传失败')
    }
  }
  return (
    <Upload
      name="file"
      action="/api/upload"
      headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
      showUploadList={false}
      accept={accept}
      onChange={handleChange}
    >
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
          <VideoCameraOutlined />
          <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value}>{value.split('/').pop()}</span>
          <Button size="small" type="link">重新上传</Button>
        </div>
      ) : (
        <Button loading={loading} icon={<UploadOutlined />}>上传文件</Button>
      )}
    </Upload>
  )
}