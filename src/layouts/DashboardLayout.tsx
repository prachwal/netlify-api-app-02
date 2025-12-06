import { useState } from 'react'
import Layout from 'antd/es/layout'
import Menu from 'antd/es/menu'
import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import Space from 'antd/es/space'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  NumberOutlined,
  SettingOutlined,
  GlobalOutlined,
  BulbOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import { setTheme } from '../store/themeSlice'
import { useTheme } from '../hooks/useTheme'

const { Header, Sider, Content } = Layout

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { themeMode } = useTheme()

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
      onClick: () => navigate('/'),
    },
    {
      key: '/counter',
      icon: <NumberOutlined />,
      label: t('nav.counter'),
      onClick: () => navigate('/counter'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: '/test',
      icon: <ExperimentOutlined />,
      label: t('nav.test'),
      onClick: () => navigate('/test'),
    },
    {
      key: '/components',
      icon: <BulbOutlined />,
      label: 'Komponenty',
      onClick: () => navigate('/components'),
    },
  ]

  const themeItems: MenuProps['items'] = [
    {
      key: 'light',
      label: t('theme.light'),
      onClick: () => dispatch(setTheme('light')),
    },
    {
      key: 'dark',
      label: t('theme.dark'),
      onClick: () => dispatch(setTheme('dark')),
    },
    {
      key: 'system',
      label: t('theme.system'),
      onClick: () => dispatch(setTheme('system')),
    },
  ]

  const languageItems: MenuProps['items'] = [
    {
      key: 'en',
      label: 'English',
      onClick: () => i18n.changeLanguage('en'),
    },
    {
      key: 'pl',
      label: 'Polski',
      onClick: () => i18n.changeLanguage('pl'),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={window.innerWidth < 768 ? 0 : 80}
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true)
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'DA' : 'Dashboard'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? (window.innerWidth < 768 ? 0 : 80) : 200 }}>
        <Header
          style={{
            padding: '0 16px',
            background: 'var(--header-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 64,
              height: 64,
            }}
          />
          <Space>
            <Dropdown menu={{ items: themeItems, selectedKeys: [themeMode] }}>
              <Button type="text" icon={<BulbOutlined />} />
            </Dropdown>
            <Dropdown menu={{ items: languageItems, selectedKeys: [i18n.language] }}>
              <Button type="text" icon={<GlobalOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: 'var(--content-bg)',
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
