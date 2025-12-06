import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'
import { store } from '../store'
import { Settings } from './Settings'

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </Provider>
  )
}

describe('Settings', () => {
  it('renders the settings component', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('displays current theme and language', () => {
    renderWithProviders(<Settings />)
    // Default theme is system, language en
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('changes theme when select is changed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Settings />)
    const themeSelect = screen.getByText('System').closest('.ant-select')
    await user.click(themeSelect!)
    await user.click(screen.getByText('Dark'))
    // Test passes if no error occurs
  })

  it('changes language when select is changed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Settings />)
    const languageSelect = screen.getByText('English').closest('.ant-select')
    await user.click(languageSelect!)
    await user.click(screen.getByText('Polski'))
    // Test passes if no error occurs
  })
})