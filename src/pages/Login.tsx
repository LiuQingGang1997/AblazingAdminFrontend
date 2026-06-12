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
    <div className="login-root">
      <Card className="login-card">
        <div style={{ marginBottom: 24 }}>
          <Title level={3} className="login-title">
            XingDongAdmin
          </Title>
          <Text className="login-subtitle">商城后台管理 · 登录</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="login-form"
        >
          <Form.Item
            name="username"
            label={<span className="login-label">用户名</span>}
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="login-prefix-icon" />}
              placeholder="请输入用户名"
              size="large"
              className="login-input"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className="login-label">密码</span>}
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="login-prefix-icon" />}
              placeholder="请输入密码"
              size="large"
              className="login-input"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className="login-submit-btn"
          >
            登录
          </Button>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text className="login-hint">联系管理员获取账号密码</Text>
        </div>
      </Card>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 10% 20%, rgba(99,102,241,0.35), transparent 40%),
            radial-gradient(circle at 90% 30%, rgba(16,185,129,0.35), transparent 35%),
            linear-gradient(135deg, #0b1020, #111827);
          padding: 24px;
        }

        .login-card {
          width: 420px;
          border-radius: 16px !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          background: rgba(255,255,255,0.06) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4) !important;
        }

        .login-card .ant-card-body {
          padding: 32px !important;
        }

        .login-title {
          margin: 0 !important;
          color: rgba(255,255,255,0.92) !important;
          font-weight: 600 !important;
          letter-spacing: 0.5px;
        }

        .login-subtitle {
          color: rgba(255,255,255,0.6) !important;
        }

        .login-label {
          color: rgba(255,255,255,0.8) !important;
          font-weight: 500;
        }

        .login-form .ant-form-item-label > label {
          color: rgba(255,255,255,0.8) !important;
        }

        /* 深色输入框基础样式 */
        .login-input,
        .login-input .ant-input,
        .login-input .ant-input-password,
        .login-input .ant-input-affix-wrapper {
          background-color: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          border-radius: 10px !important;
          transition: all 0.25s ease !important;
        }

        .login-input .ant-input,
        .login-input .ant-input-password input,
        .login-input input.ant-input {
          color: rgba(255,255,255,0.95) !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding-left: 0 !important;
        }

        .login-input::placeholder,
        .login-input .ant-input::placeholder,
        .login-input input.ant-input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }

        /* hover 状态 */
        .login-input:hover,
        .login-input.ant-input-affix-wrapper:hover,
        .login-input .ant-input-affix-wrapper:hover {
          border-color: rgba(99,102,241,0.55) !important;
          background-color: rgba(255,255,255,0.1) !important;
        }

        /* focus 状态 - 紫蓝发光特效 */
        .login-input:focus-within,
        .login-input.ant-input-affix-wrapper-focused,
        .login-input .ant-input-affix-wrapper-focused,
        .login-input.ant-input-affix-wrapper:focus-within {
          border-color: rgba(99,102,241,0.9) !important;
          box-shadow:
            0 0 0 3px rgba(99,102,241,0.25),
            0 0 20px rgba(99,102,241,0.35) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }

        /* 前缀图标 */
        .login-prefix-icon {
          color: rgba(255,255,255,0.5) !important;
        }

        .login-input:hover .login-prefix-icon {
          color: rgba(99,102,241,0.9) !important;
        }

        /* 浏览器自动填充时保持深色 */
        .login-input input:-webkit-autofill,
        .login-input input:-webkit-autofill:hover,
        .login-input input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(255,255,255,0.95) !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(30,35,55,0.99) inset !important;
          box-shadow: 0 0 0 1000px rgba(30,35,55,0.99) inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
          caret-color: rgba(255,255,255,0.9) !important;
        }

        /* 密码框的显示/隐藏按钮 */
        .login-input .ant-input-password-icon {
          color: rgba(255,255,255,0.45) !important;
        }
        .login-input .ant-input-password-icon:hover {
          color: rgba(99,102,241,0.9) !important;
        }

        /* 登录按钮 */
        .login-submit-btn {
          height: 44px !important;
          margin-top: 8px;
          font-size: 15px !important;
          font-weight: 500 !important;
          letter-spacing: 2px;
          border-radius: 10px !important;
          background: linear-gradient(135deg, #6366f1, #10b981) !important;
          border: none !important;
          box-shadow: 0 8px 24px rgba(99,102,241,0.35) !important;
          transition: all 0.25s ease !important;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 12px 32px rgba(99,102,241,0.5) !important;
          filter: brightness(1.08) !important;
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }

        .login-hint {
          color: rgba(255,255,255,0.45) !important;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}

export default Login
