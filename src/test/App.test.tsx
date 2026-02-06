import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock IndexedDB via the db module
vi.mock('../db', () => ({
  getAllCards: vi.fn().mockResolvedValue([]),
  saveCard: vi.fn().mockResolvedValue(undefined),
  deleteCard: vi.fn().mockResolvedValue(undefined),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header', async () => {
    render(<App />)
    expect(screen.getByText('My Orchestra')).toBeInTheDocument()
  })

  it('shows the add button', async () => {
    render(<App />)
    expect(screen.getByLabelText('Add new sound card')).toBeInTheDocument()
  })

  it('shows empty hint when no cards', async () => {
    render(<App />)
    expect(
      await screen.findByText(/to add your first sound card/i),
    ).toBeInTheDocument()
  })

  it('opens modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText('New Sound Card')).toBeInTheDocument()
  })

  it('modal has name input, photo buttons, and record button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))

    expect(screen.getByPlaceholderText('e.g. Veverka')).toBeInTheDocument()
    expect(screen.getByText('Choose File')).toBeInTheDocument()
    expect(screen.getByText('Take Photo')).toBeInTheDocument()
    expect(screen.getByText('Record Sound')).toBeInTheDocument()
  })

  it('closes modal on cancel', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText('New Sound Card')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText('New Sound Card')).not.toBeInTheDocument()
  })

  it('add button is disabled when name is empty', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText('Add')).toBeDisabled()
  })

  it('add button is enabled when name is filled', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))

    await user.type(screen.getByPlaceholderText('e.g. Veverka'), 'Test Sound')
    expect(screen.getByText('Add')).toBeEnabled()
  })
})
