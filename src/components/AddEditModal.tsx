import { useState, useRef, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import type { SoundCard } from '../types'

interface Props {
  card: SoundCard | null
  onSave: (card: SoundCard) => void
  onClose: () => void
}

export function AddEditModal({ card, onSave, onClose }: Props) {
  const isEditing = card !== null
  const [name, setName] = useState(card?.name ?? '')
  const [imageBlob, setImageBlob] = useState<Blob | null>(
    card?.imageBlob ?? null,
  )
  const [audioBlob, setAudioBlob] = useState<Blob | null>(
    card?.audioBlob ?? null,
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { isRecording, startRecording, stopRecording } = useAudioRecorder()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setImagePreview(null)
  }, [imageBlob])

  const handleImageFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setImageBlob(file)
      }
    },
    [],
  )

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      const blob = await stopRecording()
      setAudioBlob(blob)
    } else {
      await startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const handleSave = useCallback(() => {
    const newCard: SoundCard = {
      id: card?.id ?? uuidv4(),
      name: name.trim() || 'Untitled',
      imageBlob,
      audioBlob,
      createdAt: card?.createdAt ?? Date.now(),
    }
    onSave(newCard)
  }, [name, imageBlob, audioBlob, card, onSave])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? '\u{270F}\u{FE0F} Edit' : '\u{2728} New Sound!'}</h2>

        <label className="modal-label">
          Name
          <input
            type="text"
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give it a name..."
            autoFocus
          />
        </label>

        <div className="modal-section">
          <span className="modal-label">{'\u{1F4F7}'} Picture</span>
          <div className="modal-buttons">
            <button
              className="btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {'\u{1F5BC}\u{FE0F}'} Pick
            </button>
            <button
              className="btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              {'\u{1F4F8}'} Camera
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageFile}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleImageFile}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>

        <div className="modal-section">
          <span className="modal-label">{'\u{1F3A4}'} Sound</span>
          <button
            className={`btn btn-record ${isRecording ? 'recording' : ''}`}
            onClick={handleRecord}
          >
            {isRecording ? '\u{23F9}\u{FE0F} Stop' : audioBlob ? '\u{1F504} Record again' : '\u{26AB} Record'}
          </button>
          {audioBlob && !isRecording && (
            <span className="audio-ready">{'\u{2705}'} Recorded!</span>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-save"
            onClick={handleSave}
            disabled={false}
          >
            {isEditing ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
