import { useRef, useState, useCallback } from 'react'

export function useAudioPlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const playbackRateRef = useRef(1)

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const play = useCallback(
    async (id: string, blob: Blob, rate?: number) => {
      // Stop any currently playing sound
      if (sourceRef.current) {
        try {
          sourceRef.current.stop()
        } catch {
          /* already stopped */
        }
      }

      const ctx = getCtx()
      if (ctx.state === 'suspended') await ctx.resume()

      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = rate ?? playbackRateRef.current
      source.connect(ctx.destination)

      source.onended = () => {
        setPlayingId(null)
      }

      sourceRef.current = source
      setPlayingId(id)
      source.start()
    },
    [getCtx],
  )

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        /* already stopped */
      }
    }
    setPlayingId(null)
  }, [])

  const setRate = useCallback((rate: number) => {
    playbackRateRef.current = rate
    if (sourceRef.current) {
      sourceRef.current.playbackRate.value = rate
    }
  }, [])

  return { playingId, play, stop, setRate }
}
