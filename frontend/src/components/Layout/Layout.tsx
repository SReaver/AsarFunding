import React from 'react';
import { Layout as AntLayout, Typography } from 'antd';

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#1890ff' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Система управления коммерческими предложениями
        </Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </div>
      </Content>
    </AntLayout>
  );
};