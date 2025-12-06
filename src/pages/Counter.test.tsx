import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'
import { store } from '../store'
import { Counter } from './Counter'

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

describe('Counter', () => {
  it('renders the counter component', () => {
    renderWithProviders(<Counter />)
    expect(screen.getByText('Counter')).toBeInTheDocument()
    expect(screen.getByText('Edit src/pages/Counter.tsx and save to test HMR')).toBeInTheDocument()
  })

  it('displays initial count', () => {
    renderWithProviders(<Counter />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments count when + button is clicked', () => {
    renderWithProviders(<Counter />)
    const incrementButton = screen.getByRole('button', { name: /\+1/i })
    fireEvent.click(incrementButton)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements count when - button is clicked', () => {
    renderWithProviders(<Counter />)
    const decrementButton = screen.getByRole('button', { name: /-1/i })
    fireEvent.click(decrementButton)
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('resets count when reset button is clicked', () => {
    renderWithProviders(<Counter />)
    const incrementButton = screen.getByRole('button', { name: /\+1/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(incrementButton)
    fireEvent.click(incrementButton)
    expect(screen.getByText('2')).toBeInTheDocument()
    fireEvent.click(resetButton)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})