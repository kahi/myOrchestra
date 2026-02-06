import { describe, it, expect, beforeEach } from 'vitest'
import { getAllCards, saveCard, deleteCard } from '../db'
import type { SoundCard } from '../types'

// fake-indexeddb is auto-provided by jsdom in vitest
import 'fake-indexeddb/auto'

const makeCard = (id: string, name: string): SoundCard => ({
  id,
  name,
  imageBlob: null,
  audioBlob: null,
  createdAt: Date.now(),
})

describe('db', () => {
  beforeEach(async () => {
    // Clear all cards
    const cards = await getAllCards()
    for (const c of cards) {
      await deleteCard(c.id)
    }
  })

  it('starts empty', async () => {
    const cards = await getAllCards()
    expect(cards).toEqual([])
  })

  it('can save and retrieve a card', async () => {
    const card = makeCard('1', 'Test')
    await saveCard(card)
    const cards = await getAllCards()
    expect(cards).toHaveLength(1)
    expect(cards[0].name).toBe('Test')
  })

  it('can delete a card', async () => {
    await saveCard(makeCard('1', 'A'))
    await saveCard(makeCard('2', 'B'))
    await deleteCard('1')
    const cards = await getAllCards()
    expect(cards).toHaveLength(1)
    expect(cards[0].id).toBe('2')
  })

  it('can update a card', async () => {
    await saveCard(makeCard('1', 'Old'))
    await saveCard({ ...makeCard('1', 'New'), createdAt: Date.now() })
    const cards = await getAllCards()
    expect(cards).toHaveLength(1)
    expect(cards[0].name).toBe('New')
  })
})
