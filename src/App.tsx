import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App as AntdApp, Spin } from 'antd'
import './App.css'

// Lazy load components
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(module => ({ default: module.DashboardLayout })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Counter = lazy(() => import('./pages/Counter').then(module => ({ default: module.Counter })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const TestNotifications = lazy(() => import('./pages/TestNotifications').then(module => ({ default: module.TestNotifications })))
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })))
const ErrorPage = lazy(() => import('./pages/ErrorPage').then(module => ({ default: module.ErrorPage })))

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <Spin size="large" />
  </div>
)

function AppContent() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="counter" element={<Counter />} />
            <Route path="settings" element={<Settings />} />
            <Route path="test" element={<TestNotifications />} />
          </Route>
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AntdApp>
      <AppContent />
    </AntdApp>
  )
}

export default App
