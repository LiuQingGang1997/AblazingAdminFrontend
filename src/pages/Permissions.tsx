import React from 'react'
import { Card, Descriptions, Typography } from 'antd'

const { Title, Text } = Typography

const Permissions: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          权限配置
        </Title>
        <Text type="secondary">当前版本按角色控制访问</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 14 }}>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="ADMIN">
            用户管理、权限配置、产品/案例增删改查
          </Descriptions.Item>
          <Descriptions.Item label="EDITOR">
            产品/案例增删改查
          </Descriptions.Item>
          <Descriptions.Item label="VIEWER">
            只读访问（产品/案例查询）
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default Permissions

