import { useState, useEffect } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { setTheme, setLanguage } from '../store/settingsSlice'
import { useTheme } from '../hooks/useTheme'

const { Header, Sider, Content } = Layout

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { themeMode } = useTheme()
  const language = useSelector((state: RootState) => state.settings.language)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
      onClick: () => {
        navigate('/')
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: '/counter',
      icon: <NumberOutlined />,
      label: t('nav.counter'),
      onClick: () => {
        navigate('/counter')
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => {
        navigate('/settings')
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: '/test',
      icon: <ExperimentOutlined />,
      label: t('nav.test'),
      onClick: () => {
        navigate('/test')
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: '/components',
      icon: <BulbOutlined />,
      label: 'Komponenty',
      onClick: () => {
        navigate('/components')
        if (isMobile) setCollapsed(true)
      },
    },
  ]

  const themeItems: MenuProps['items'] = [
    {
      key: 'light',
      label: t('theme.light'),
      onClick: () => {
        dispatch(setTheme('light'))
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: 'dark',
      label: t('theme.dark'),
      onClick: () => {
        dispatch(setTheme('dark'))
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: 'system',
      label: t('theme.system'),
      onClick: () => {
        dispatch(setTheme('system'))
        if (isMobile) setCollapsed(true)
      },
    },
  ]

  const languageItems: MenuProps['items'] = [
    {
      key: 'en',
      label: 'English',
      onClick: () => {
        dispatch(setLanguage('en'))
        i18n.changeLanguage('en')
        if (isMobile) setCollapsed(true)
      },
    },
    {
      key: 'pl',
      label: 'Polski',
      onClick: () => {
        dispatch(setLanguage('pl'))
        i18n.changeLanguage('pl')
        if (isMobile) setCollapsed(true)
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true)
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: isMobile ? 'fixed' : 'fixed',
          left: isMobile && !collapsed ? 0 : collapsed ? (isMobile ? -200 : -120) : 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 'auto',
          transition: 'left 0.3s',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 'clamp(14px, 4vw, 16px)' : 'clamp(16px, 5vw, 20px)',
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
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200) }}>
        <Header
          style={{
            padding: isMobile ? '0 8px' : '0 16px',
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
              width: isMobile ? 48 : 64,
              height: 64,
            }}
          />
          <Space>
            <Dropdown menu={{ items: themeItems, selectedKeys: [themeMode] }}>
              <Button type="text" icon={<BulbOutlined />} />
            </Dropdown>
            <Dropdown menu={{ items: languageItems, selectedKeys: [language] }}>
              <Button type="text" icon={<GlobalOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: isMobile ? '16px 8px' : '24px 16px',
            padding: isMobile ? 16 : 24,
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
