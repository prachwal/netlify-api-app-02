import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement, reset } from '../store/counterSlice'
import type { RootState, AppDispatch } from '../store'
import Button from 'antd/es/button'
import Space from 'antd/es/space'
import Card from 'antd/es/card'
import Statistic from 'antd/es/statistic'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.count)
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('counter.title')}</h1>
      <p style={{ marginBottom: 24 }}>{t('counter.description')}</p>

      <Card style={{ maxWidth: 400 }}>
        <Statistic
          title={t('counter.button')}
          value={count}
          styles={{ content: { fontSize: 48, textAlign: 'center' } }}
        />
        <Space style={{ width: '100%', justifyContent: 'center', marginTop: 24 }} size="large">
          <Button
            type="primary"
            icon={<MinusOutlined />}
            onClick={() => dispatch(decrement())}
            size="large"
          >
            -1
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(reset())}
            size="large"
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(increment())}
            size="large"
          >
            +1
          </Button>
        </Space>
      </Card>
    </div>
  )
}
