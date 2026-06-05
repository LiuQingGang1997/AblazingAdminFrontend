import React, { useState } from 'react'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true)
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (e) {
      message.error('用户名或密码错误，或后端未启动')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 10% 20%, rgba(99,102,241,0.35), transparent 40%), radial-gradient(circle at 90% 30%, rgba(16,185,129,0.35), transparent 35%), linear-gradient(135deg, #0b1020, #111827)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0, color: 'rgba(255,255,255,0.92)' }}>
            XingDongAdmin
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
            商城后台管理 · 登录
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>用户名</span>}
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>密码</span>}
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="admin123"
              size="large"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            登录
          </Button>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.55)' }}>
            默认账号：admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login

