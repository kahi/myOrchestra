import { useState, useEffect, useCallback } from 'react'
import type { SoundCard } from './types'
import { getAllCards, saveCard, deleteCard } from './db'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { SoundCardTile } from './components/SoundCardTile'
import { AddEditModal } from './components/AddEditModal'
import './App.css'

function App() {
  const [cards, setCards] = useState<SoundCard[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<SoundCard | null>(null)
  const { playingId, play, stop } = useAudioPlayer()

  useEffect(() => {
    getAllCards().then(setCards)
  }, [])

  const handleTap = useCallback(
    (id: string, blob: Blob, rate?: number) => {
      if (playingId === id && !rate) {
        stop()
      } else {
        play(id, blob, rate)
      }
    },
    [playingId, play, stop],
  )

  const handleSave = useCallback(
    async (card: SoundCard) => {
      await saveCard(card)
      const updated = await getAllCards()
      setCards(updated)
      setModalOpen(false)
      setEditingCard(null)
    },
    [],
  )

  const handleDelete = useCallback(async (id: string) => {
    await deleteCard(id)
    const updated = await getAllCards()
    setCards(updated)
  }, [])

  const handleEdit = useCallback((card: SoundCard) => {
    setEditingCard(card)
    setModalOpen(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditingCard(null)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingCard(null)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>My Orchestra</h1>
      </header>

      <main className="card-grid">
        {cards.map((card) => (
          <SoundCardTile
            key={card.id}
            card={card}
            isPlaying={playingId === card.id}
            onTap={handleTap}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        <button
          className="add-card"
          onClick={handleAdd}
          aria-label="Add new sound card"
        >
          <span className="add-icon">+</span>
        </button>
      </main>

      {cards.length === 0 && (
        <p className="empty-hint">
          Tap <strong>+</strong> to add your first sound card
        </p>
      )}

      {modalOpen && (
        <AddEditModal
          card={editingCard}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default App
