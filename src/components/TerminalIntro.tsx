import { useEffect, useState } from 'react'

interface TerminalIntroProps {
  text: string
  typingSpeedMs?: number
}

export function TerminalIntro({ text, typingSpeedMs = 80 }: TerminalIntroProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    if (!text) {
      setIsComplete(true)
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    let index = 0
    const timerId = window.setInterval(() => {
      index += 1
      setDisplayedText(text.slice(0, index))

      if (index >= text.length) {
        window.clearInterval(timerId)
        setIsComplete(true)
      }
    }, typingSpeedMs)

    return () => {
      window.clearInterval(timerId)
    }
  }, [text, typingSpeedMs])

  return (
    <p
      className="font-mono text-3xl font-semibold tracking-tight text-emerald-400 sm:text-4xl"
      aria-live="polite"
    >
      {displayedText}
      {!isComplete ? (
        <span
          className="ml-1 inline-block h-8 w-2 animate-pulse bg-emerald-400 align-middle sm:h-10"
          aria-hidden="true"
        />
      ) : null}
    </p>
  )
}
