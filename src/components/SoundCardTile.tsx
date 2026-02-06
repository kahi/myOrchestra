import { useRef, useState, useCallback, useMemo } from 'react'
import type { SoundCard } from '../types'
import { usePinch } from '../hooks/usePinch'

interface Props {
  card: SoundCard
  isPlaying: boolean
  onTap: (id: string, blob: Blob, rate?: number) => void
  onEdit: (card: SoundCard) => void
  onDelete: (id: string) => void
}

const CARD_ANIMALS = [
  '\u{1F43B}', '\u{1F431}', '\u{1F436}', '\u{1F42F}',
  '\u{1F981}', '\u{1F438}', '\u{1F427}', '\u{1F422}',
  '\u{1F40D}', '\u{1F989}', '\u{1F41D}', '\u{1F98B}',
]

function animalForId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return CARD_ANIMALS[Math.abs(hash) % CARD_ANIMALS.length]
}

export function SoundCardTile({
  card,
  isPlaying,
  onTap,
  onEdit,
  onDelete,
}: Props) {
  const tileRef = useRef<HTMLDivElement>(null)
  const [pitchScale, setPitchScale] = useState(1)

  const imageUrl = useMemo(
    () => (card.imageBlob ? URL.createObjectURL(card.imageBlob) : null),
    [card.imageBlob],
  )

  const pinchCallbacks = useMemo(
    () => ({
      onPinchChange: (scale: number) => {
        setPitchScale(scale)
        if (card.audioBlob) {
          onTap(card.id, card.audioBlob, scale)
        }
      },
      onPinchEnd: () => {
        setPitchScale(1)
      },
    }),
    [card.audioBlob, card.id, onTap],
  )

  usePinch(tileRef, pinchCallbacks)

  const handleTap = useCallback(() => {
    if (card.audioBlob) {
      onTap(card.id, card.audioBlob)
    }
  }, [card.audioBlob, card.id, onTap])

  return (
    <div
      ref={tileRef}
      className={`sound-card ${isPlaying ? 'playing' : ''}`}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label={`Play ${card.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTap()
      }}
    >
      {/* Always-visible edit & delete mini buttons */}
      <button
        className="card-btn-edit"
        aria-label={`Edit ${card.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onEdit(card)
        }}
      >
        &#9998;
      </button>
      <button
        className="card-btn-delete"
        aria-label={`Delete ${card.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(card.id)
        }}
      >
        &#10005;
      </button>

      {imageUrl ? (
        <img src={imageUrl} alt={card.name} className="card-image" />
      ) : (
        <div className="card-placeholder">
          <span className="card-placeholder-icon">{animalForId(card.id)}</span>
        </div>
      )}
      <div className="card-name">{card.name}</div>

      {pitchScale !== 1 && (
        <div className="pitch-indicator">{pitchScale.toFixed(1)}x</div>
      )}

      {isPlaying && <div className="playing-indicator" />}
    </div>
  )
}
