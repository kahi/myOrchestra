export interface SoundCard {
  id: string
  name: string
  imageBlob: Blob | null
  audioBlob: Blob | null
  createdAt: number
}
