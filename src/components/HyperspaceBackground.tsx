import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  speed: number
  shimmer: number
}

const STARFIELD = {
  baseDensity: 6200,
  minimumStars: 170,
  minSpeed: 0.006,
  maxSpeed: 0.02,
  minShimmer: 0.1,
  maxShimmer: 0.32,
  maxDelta: 2,
} as const

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function HyperspaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    let rafId = 0
    let lastFrameTime = performance.now()
    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0
    let focalLength = 0
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stars: Star[] = []

    const resetStar = (star: Star, spawnFar = false) => {
      const angle = randomInRange(0, Math.PI * 2)
      const radius = Math.sqrt(Math.random()) * (spawnFar ? 1.25 : 1)
      star.x = Math.cos(angle) * radius
      star.y = Math.sin(angle) * radius
      star.z = spawnFar ? randomInRange(0.7, 1.15) : randomInRange(0.12, 1.05)
      star.speed = randomInRange(STARFIELD.minSpeed, STARFIELD.maxSpeed)
      star.shimmer = randomInRange(STARFIELD.minShimmer, STARFIELD.maxShimmer)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      centerX = width / 2
      centerY = height / 2
      focalLength = Math.min(width, height) * 0.82

      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.scale(dpr, dpr)

      const starCount = Math.max(
        STARFIELD.minimumStars,
        Math.floor((width * height) / STARFIELD.baseDensity)
      )
      stars.length = 0
      for (let i = 0; i < starCount; i += 1) {
        const star: Star = { x: 0, y: 0, z: 0, speed: 0, shimmer: 0 }
        resetStar(star)
        stars.push(star)
      }
    }

    const drawNebula = () => {
      const glow = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.72
      )
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)')
      glow.addColorStop(0.55, 'rgba(37, 99, 235, 0.16)')
      glow.addColorStop(1, 'rgba(15, 23, 42, 0)')

      context.fillStyle = glow
      context.fillRect(0, 0, width, height)
    }

    const drawStaticFrame = () => {
      context.clearRect(0, 0, width, height)
      drawNebula()

      for (const star of stars) {
        const sx = centerX + star.x * width * 0.46
        const sy = centerY + star.y * height * 0.46

        if (sx < 0 || sx > width || sy < 0 || sy > height) {
          resetStar(star, true)
          continue
        }

        context.beginPath()
        context.fillStyle = `rgba(186, 230, 253, ${star.shimmer})`
        context.arc(sx, sy, 1.15, 0, Math.PI * 2)
        context.fill()
      }
    }

    const animate = (now: number) => {
      const delta = Math.min((now - lastFrameTime) / 16.67, STARFIELD.maxDelta)
      lastFrameTime = now

      context.clearRect(0, 0, width, height)
      drawNebula()

      for (const star of stars) {
        const previousZ = star.z
        star.z -= star.speed * delta

        if (star.z <= 0.045) {
          resetStar(star, true)
          continue
        }

        const sx = centerX + (star.x / star.z) * focalLength
        const sy = centerY + (star.y / star.z) * focalLength
        const px = centerX + (star.x / previousZ) * focalLength
        const py = centerY + (star.y / previousZ) * focalLength

        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) {
          resetStar(star, true)
          continue
        }

        const intensity = Math.max(0.08, 0.36 - star.z * 0.1 + star.shimmer)
        context.strokeStyle = `rgba(186, 230, 253, ${intensity})`
        context.lineWidth = Math.max(0.7, (1 - star.z) * 2.8)
        context.beginPath()
        context.moveTo(px, py)
        context.lineTo(sx, sy)
        context.stroke()
      }

      rafId = window.requestAnimationFrame(animate)
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches
      window.cancelAnimationFrame(rafId)
      if (reducedMotion) {
        drawStaticFrame()
      } else {
        lastFrameTime = performance.now()
        rafId = window.requestAnimationFrame(animate)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onMotionChange)
    } else {
      mediaQuery.addListener(onMotionChange)
    }

    if (reducedMotion) {
      drawStaticFrame()
    } else {
      rafId = window.requestAnimationFrame(animate)
    }

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', onMotionChange)
      } else {
        mediaQuery.removeListener(onMotionChange)
      }
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full opacity-85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(9,9,11,0.27)_68%,rgba(9,9,11,0.56)_100%)]" />
    </div>
  )
}
