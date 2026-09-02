import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { cn } from '@/lib/utils'

/** How long a tap keeps the glitch running on touch screens, which have no hover. */
const TOUCH_PLAY_MS = 2500

interface AvatarProps {
  src: string
  alt: string
  className?: string
}

export function Avatar({ src, alt, className }: AvatarProps) {
  const touchTimer = useRef(0)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => () => window.clearTimeout(touchTimer.current), [])

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    setIsGlitching(true)
    if (event.pointerType !== 'touch') return
    window.clearTimeout(touchTimer.current)
    touchTimer.current = window.setTimeout(() => setIsGlitching(false), TOUCH_PLAY_MS)
  }

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') setIsGlitching(false)
  }

  return (
    <div
      className={cn(
        'avatar-glitch relative h-36 w-36 overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-900 shadow-xl shadow-black/30 sm:h-40 sm:w-40',
        className
      )}
      style={{ '--avatar-src': `url("${src}")` } as CSSProperties}
      data-active={isGlitching || undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <span className="avatar-glitch__scanlines" aria-hidden="true" />
    </div>
  )
}
