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
    expect(screen.getByText(/My Orchestra/)).toBeInTheDocument()
  })

  it('shows the add button', async () => {
    render(<App />)
    expect(screen.getByLabelText('Add new sound card')).toBeInTheDocument()
  })

  it('shows empty hint when no cards', async () => {
    render(<App />)
    expect(
      await screen.findByText(/to make your first sound/i),
    ).toBeInTheDocument()
  })

  it('opens modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText(/New Sound/)).toBeInTheDocument()
  })

  it('modal has name input, photo buttons, and record button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))

    expect(screen.getByPlaceholderText(/give it a name/i)).toBeInTheDocument()
    expect(screen.getByText(/Pick/)).toBeInTheDocument()
    expect(screen.getByText(/Camera/)).toBeInTheDocument()
    expect(screen.getByText(/Record/)).toBeInTheDocument()
  })

  it('closes modal on cancel', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText(/New Sound/)).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText(/New Sound/)).not.toBeInTheDocument()
  })

  it('add button is always enabled (name is optional)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Add new sound card'))
    expect(screen.getByText('Add')).toBeEnabled()
  })
})
