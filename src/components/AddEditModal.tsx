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
        <h2>{isEditing ? 'Edit Card' : 'New Sound Card'}</h2>

        <label className="modal-label">
          Name (optional)
          <input
            type="text"
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Veverka"
            autoFocus
          />
        </label>

        <div className="modal-section">
          <span className="modal-label">Photo</span>
          <div className="modal-buttons">
            <button
              className="btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
            <button
              className="btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              Take Photo
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
          <span className="modal-label">Sound</span>
          <button
            className={`btn btn-record ${isRecording ? 'recording' : ''}`}
            onClick={handleRecord}
          >
            {isRecording ? 'Stop Recording' : audioBlob ? 'Re-record' : 'Record Sound'}
          </button>
          {audioBlob && !isRecording && (
            <span className="audio-ready">Audio ready</span>
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
