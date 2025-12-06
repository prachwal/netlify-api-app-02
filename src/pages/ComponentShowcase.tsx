import { Tabs, Card } from 'antd'
import { LoginForm } from '../components/LoginForm'
import { UserTable } from '../components/UserTable'
import { NavigationExample } from '../components/NavigationExample'
import { FeedbackComponents } from '../components/FeedbackComponents'
import { DataEntryExample } from '../components/DataEntryExample'
import { LayoutComponents } from '../components/LayoutComponents'

export const ComponentShowcase = () => {
  const items = [
    {
      key: '1',
      label: 'Formularze',
      children: <LoginForm />
    },
    {
      key: '2',
      label: 'Tabele',
      children: <UserTable />
    },
    {
      key: '3',
      label: 'Nawigacja',
      children: <NavigationExample />
    },
    {
      key: '4',
      label: 'Feedback',
      children: <FeedbackComponents />
    },
    {
      key: '5',
      label: 'Wprowadzanie danych',
      children: <DataEntryExample />
    },
    {
      key: '6',
      label: 'Komponenty layout',
      children: <LayoutComponents />
    }
  ]

  return (
    <div>
      <h1>Pokaż komponentów Ant Design</h1>
      <p>Przeglądaj różne komponenty dostępne w boilerplate</p>

      <Card style={{ marginTop: 24 }}>
        <Tabs
          defaultActiveKey="1"
          items={items}
          type="card"
          size="large"
        />
      </Card>
    </div>
  )
}