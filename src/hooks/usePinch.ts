import { useRef, useEffect, useCallback } from 'react'

interface PinchCallbacks {
  onPinchChange: (scale: number) => void
  onPinchEnd: () => void
}

export function usePinch(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: PinchCallbacks,
) {
  const initialDistRef = useRef(0)

  const getDistance = useCallback((touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        initialDistRef.current = getDistance(e.touches)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistRef.current > 0) {
        e.preventDefault()
        const currentDist = getDistance(e.touches)
        const scale = currentDist / initialDistRef.current
        // Clamp between 0.25 and 4 for playback rate
        const clampedScale = Math.max(0.25, Math.min(4, scale))
        callbacks.onPinchChange(clampedScale)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && initialDistRef.current > 0) {
        initialDistRef.current = 0
        callbacks.onPinchEnd()
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [elementRef, callbacks, getDistance])
}
