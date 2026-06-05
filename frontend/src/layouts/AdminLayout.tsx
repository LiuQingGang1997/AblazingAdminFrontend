import React, { useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, Space, Typography, theme } from 'antd'
import {
  AppstoreOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
  PictureOutlined,
  MessageOutlined,
  CrownOutlined,
  ShopOutlined,
  TagsOutlined,
  BlockOutlined,
} from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext'

const { Header, Content, Sider } = Layout
const { Text } = Typography

type MenuItem = {
  key: string
  icon: React.ReactNode
  label: React.ReactNode
  roles?: Array<'ADMIN' | 'EDITOR' | 'VIEWER'>
}

const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, hasRole } = useAuth()
  const { token } = theme.useToken()

  const items = useMemo<MenuItem[]>(() => {
    const all: MenuItem[] = [
      {
        key: '/',
        icon: <AppstoreOutlined />,
        label: <Link to="/">仪表盘</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/banners',
        icon: <PictureOutlined />,
        label: <Link to="/banners">Banner管理</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/brands',
        icon: <CrownOutlined />,
        label: <Link to="/brands">品牌墙</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/mall-brands',
        icon: <ShopOutlined />,
        label: <Link to="/mall-brands">商城入驻品牌</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/product-types',
        icon: <TagsOutlined />,
        label: <Link to="/product-types">产品类型</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/product-scenes',
        icon: <BlockOutlined />,
        label: <Link to="/product-scenes">产品场景</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: <Link to="/products">产品管理</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/cases',
        icon: <FileTextOutlined />,
        label: <Link to="/cases">案例管理</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/customer-reviews',
        icon: <MessageOutlined />,
        label: <Link to="/customer-reviews">客户评价</Link>,
        roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      },
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: <Link to="/users">用户管理</Link>,
        roles: ['ADMIN'],
      },
      {
        key: '/permissions',
        icon: <SettingOutlined />,
        label: <Link to="/permissions">权限配置</Link>,
        roles: ['ADMIN'],
      },
    ]

    return all.filter((i) => {
      if (!i.roles || i.roles.length === 0) return true
      if (!user) return false
      return i.roles.includes(user.role)
    })
  }, [user])

  const selectedKeys = useMemo(() => {
    const p = location.pathname
    if (p === '/') return ['/']
    const hit = items.find((i) => p === i.key || p.startsWith(i.key + '/'))
    return hit ? [hit.key] : []
  }, [items, location.pathname])

  const userMenu = useMemo(() => {
    return [
      {
        key: 'profile',
        label: (
          <Space>
            <UserOutlined />
            <span>当前账号：{user?.username ?? '-'}</span>
          </Space>
        ),
        disabled: true,
      },
      {
        key: 'role',
        label: <span>角色：{user?.role ?? '-'}</span>,
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: (
          <Space>
            <LogoutOutlined />
            <span>退出登录</span>
          </Space>
        ),
        onClick: () => {
          logout()
          navigate('/login', { replace: true })
        },
      },
    ]
  }, [logout, navigate, user?.role, user?.username])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={256}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #0b1020 0%, #0f172a 55%, #111827 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #10b981)',
              boxShadow: '0 10px 30px rgba(99,102,241,0.25)',
            }}
          />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
              XingDongAdmin
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              E-Commerce Console
            </div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
          style={{ background: 'transparent' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Space>
            <AppstoreOutlined />
            <Text strong>后台管理</Text>
          </Space>
          <Dropdown menu={{ items: userMenu }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{
                  background: hasRole('ADMIN') ? '#6366f1' : hasRole('EDITOR') ? '#10b981' : '#64748b',
                }}
              >
                {user?.username?.slice(0, 1)?.toUpperCase() ?? 'U'}
              </Avatar>
              <Text>{user?.username ?? '-'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 18 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout

