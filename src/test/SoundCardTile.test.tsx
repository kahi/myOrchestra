import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SoundCardTile } from '../components/SoundCardTile'
import type { SoundCard } from '../types'

const makeCard = (overrides?: Partial<SoundCard>): SoundCard => ({
  id: 'test-1',
  name: 'Veverka',
  imageBlob: null,
  audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
  createdAt: Date.now(),
  ...overrides,
})

describe('SoundCardTile', () => {
  it('renders card name', () => {
    render(
      <SoundCardTile
        card={makeCard()}
        isPlaying={false}
        onTap={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Veverka')).toBeInTheDocument()
  })

  it('shows placeholder when no image', () => {
    const { container } = render(
      <SoundCardTile
        card={makeCard()}
        isPlaying={false}
        onTap={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(container.querySelector('.card-placeholder')).toBeInTheDocument()
  })

  it('calls onTap when clicked', async () => {
    const onTap = vi.fn()
    const user = userEvent.setup()
    render(
      <SoundCardTile
        card={makeCard()}
        isPlaying={false}
        onTap={onTap}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Play Veverka/i }))
    expect(onTap).toHaveBeenCalledWith(
      'test-1',
      expect.any(Blob),
    )
  })

  it('shows playing indicator when isPlaying', () => {
    const { container } = render(
      <SoundCardTile
        card={makeCard()}
        isPlaying={true}
        onTap={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(container.querySelector('.playing-indicator')).toBeInTheDocument()
  })

  it('has edit and delete buttons', () => {
    render(
      <SoundCardTile
        card={makeCard({ name: 'Flamingo' })}
        isPlaying={false}
        onTap={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Edit Flamingo')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete Flamingo')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    const card = makeCard()
    render(
      <SoundCardTile
        card={card}
        isPlaying={false}
        onTap={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    )
    await user.click(screen.getByLabelText('Edit Veverka'))
    expect(onEdit).toHaveBeenCalledWith(card)
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(
      <SoundCardTile
        card={makeCard()}
        isPlaying={false}
        onTap={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    )
    await user.click(screen.getByLabelText('Delete Veverka'))
    expect(onDelete).toHaveBeenCalledWith('test-1')
  })
})
