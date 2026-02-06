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

export function SoundCardTile({
  card,
  isPlaying,
  onTap,
  onEdit,
  onDelete,
}: Props) {
  const tileRef = useRef<HTMLDivElement>(null)
  const [pitchScale, setPitchScale] = useState(1)
  const [showControls, setShowControls] = useState(false)

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

  const handleLongPress = useCallback(() => {
    setShowControls((v) => !v)
  }, [])

  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const onPointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(handleLongPress, 500)
  }, [handleLongPress])

  const onPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  return (
    <div
      ref={tileRef}
      className={`sound-card ${isPlaying ? 'playing' : ''}`}
      onClick={handleTap}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="button"
      tabIndex={0}
      aria-label={`Play ${card.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTap()
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={card.name} className="card-image" />
      ) : (
        <div className="card-placeholder">
          <span className="card-placeholder-icon">&#9835;</span>
        </div>
      )}
      <div className="card-name">{card.name}</div>

      {pitchScale !== 1 && (
        <div className="pitch-indicator">{pitchScale.toFixed(2)}x</div>
      )}

      {isPlaying && <div className="playing-indicator" />}

      {showControls && (
        <div className="card-controls" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-edit"
            onClick={() => {
              setShowControls(false)
              onEdit(card)
            }}
          >
            Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => {
              setShowControls(false)
              onDelete(card.id)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
