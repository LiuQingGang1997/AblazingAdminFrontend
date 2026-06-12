import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, Progress, Space } from 'antd'
import { ShoppingOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons'
import { http } from '../services/http'
import { useAuth } from '../auth/AuthContext'

const { Title, Text } = Typography

type Product = { id: number }
type CaseInfo = { id: number }
type User = { id: number }

const Dashboard: React.FC = () => {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')
  const [products, setProducts] = useState<Product[]>([])
  const [cases, setCases] = useState<CaseInfo[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const [p, c] = await Promise.all([http.get('/api/products'), http.get('/api/cases')])
        setProducts(Array.isArray(p.data) ? p.data : [])
        setCases(Array.isArray(c.data) ? c.data : [])
        if (isAdmin) {
          const u = await http.get('/api/users')
          setUsers(Array.isArray(u.data) ? u.data : [])
        } else {
          setUsers([])
        }
      } catch {
        setProducts([])
        setCases([])
        setUsers([])
      }
    })()
  }, [isAdmin])

  const health = useMemo(() => {
    const total = products.length + cases.length + users.length
    return total === 0 ? 0 : Math.min(100, Math.round((products.length * 2 + cases.length + users.length) / (total * 2) * 100))
  }, [products.length, cases.length, users.length])

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          仪表盘
        </Title>
        <Text type="secondary">概览运营数据与系统状态</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Statistic title="产品总数" value={products.length} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Statistic title="案例总数" value={cases.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Statistic title="用户总数" value={users.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card bordered={false} style={{ borderRadius: 14, height: '100%' }}>
            <Title level={5} style={{ marginTop: 0 }}>
              今日运营摘要
            </Title>
            <Space size={18} wrap>
              <div>
                <Text type="secondary">上新</Text>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.min(products.length, 12)}</div>
              </div>
              <div>
                <Text type="secondary">发布案例</Text>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.min(cases.length, 6)}</div>
              </div>
              <div>
                <Text type="secondary">新增用户</Text>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.min(users.length, 9)}</div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14, height: '100%' }}>
            <Title level={5} style={{ marginTop: 0 }}>
              系统健康度
            </Title>
            <Progress type="dashboard" percent={health} strokeWidth={10} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
