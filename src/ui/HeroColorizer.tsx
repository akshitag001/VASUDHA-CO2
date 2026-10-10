import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react'

/**
 * HeroColorizer:
 * Interactive watercolor reveal layer for the pastoral countryside background sketch.
 * As the user moves their cursor over the hero, vibrant handcrafted watercolor pigments
 * (golden sunlight, lush mango tree greens, saffron fruits, terracotta roofs, and meadow pastures)
 * get painted onto the paper canvas at 60fps.
 */
export function HeroColorizer({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const dirtyRef = useRef<boolean>(false)
  const activePointRef = useRef<{ x: number; y: number; active: boolean }>({ x: 800, y: 400, active: false })
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [fillPercent, setFillPercent] = useState<number>(0)
  const [isFullyColored, setIsFullyColored] = useState<boolean>(false)

  // Internal resolution matching hero-landscape aspect ratio (1600 x 800)
  const WIDTH = 1600
  const HEIGHT = 800

  // 1. Generate the vibrant watercolor master painting once on an offscreen canvas
  const createWatercolorMaster = useCallback(() => {
    const off = document.createElement('canvas')
    off.width = WIDTH
    off.height = HEIGHT
    const ctx = off.getContext('2d')
    if (!ctx) return off

    // Smooth watercolor wash base
    ctx.fillStyle = '#fefcf6'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Helper to draw soft watercolor blobs
    const wash = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      color: string,
      opacity = 0.8,
      blur = 30
    ) => {
      ctx.save()
      ctx.filter = `blur(${blur}px)`
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // ----------------- Sky & Dawn Atmosphere
    // Soft morning azure sky in upper-center & left
    wash(500, 140, 480, 160, '#cce7f5', 0.65, 50)
    wash(900, 160, 420, 150, '#ffecd1', 0.7, 45)

    // ----------------- Sun & Radiating Corona (Top Right: ~1260, 180)
    wash(1260, 180, 220, 200, '#ffe066', 0.9, 35)
    wash(1260, 180, 140, 130, '#ffd100', 0.85, 20)
    wash(1260, 180, 70, 70, '#ff9e00', 0.9, 12)

    // ----------------- Left Spreading Tree & Branches (0 to 450, 0 to 520)
    wash(180, 160, 200, 160, '#2d6a4f', 0.85, 40)
    wash(120, 280, 190, 180, '#40916c', 0.88, 35)
    wash(260, 220, 180, 150, '#52b788', 0.82, 35)
    wash(340, 140, 150, 130, '#74c69d', 0.78, 30)
    wash(220, 360, 160, 140, '#1b4332', 0.85, 35)
    // Tender chartreuse leaf highlights
    wash(150, 120, 120, 100, '#95d5b2', 0.75, 25)
    wash(280, 320, 130, 110, '#aacc00', 0.7, 25)

    // ----------------- Right Mango Tree & Canopy (1200 to 1600, 0 to 550)
    wash(1460, 220, 180, 170, '#2d6a4f', 0.85, 38)
    wash(1520, 340, 160, 180, '#40916c', 0.85, 35)
    wash(1380, 290, 140, 130, '#52b788', 0.8, 30)
    wash(1480, 140, 130, 120, '#74c69d', 0.75, 28)
    // Saffron Ripe Mango Clusters (around 1420-1530, 240-340)
    wash(1420, 260, 35, 45, '#ff9e00', 0.95, 10)
    wash(1450, 310, 32, 42, '#fb8500', 0.95, 10)
    wash(1490, 275, 34, 44, '#ffb703', 0.95, 10)
    wash(1540, 320, 30, 40, '#f77f00', 0.95, 10)

    // ----------------- Distant Mountain Ridges (across 200 to 1400, y: 460 to 580)
    wash(400, 520, 260, 60, '#9bb1c8', 0.65, 35)
    wash(800, 540, 380, 70, '#8390fa', 0.6, 40)
    wash(1150, 530, 280, 65, '#9aa5b8', 0.65, 35)

    // ----------------- Village Huts & Roofs (Bottom Left: 30 to 360, 560 to 740)
    // Warm terracotta red clay roofs
    wash(120, 640, 110, 45, '#c84b31', 0.92, 18)
    wash(210, 650, 85, 40, '#d9534f', 0.9, 18)
    wash(280, 670, 75, 35, '#d65a31', 0.9, 16)
    wash(60, 660, 65, 35, '#e07a5f', 0.88, 16)
    // Earthen cream house walls
    wash(130, 680, 100, 40, '#ede0d4', 0.85, 20)
    wash(210, 690, 80, 35, '#f4ecd8', 0.85, 18)
    // Surrounding banana and palm greenery
    wash(160, 590, 80, 60, '#2d6a4f', 0.8, 25)
    wash(80, 610, 70, 50, '#52b788', 0.8, 25)

    // ----------------- Agricultural Fields & Terraces (Center Bottom: 280 to 1250, 580 to 800)
    // Lush paddy fields & bunds
    wash(520, 680, 220, 90, '#55a630', 0.82, 35)
    wash(760, 700, 240, 85, '#80b918', 0.85, 35)
    wash(980, 690, 220, 80, '#aacc00', 0.82, 35)
    wash(420, 740, 240, 70, '#38b000', 0.8, 30)
    wash(680, 750, 260, 65, '#70e000', 0.82, 30)
    wash(940, 760, 250, 65, '#9ef01a', 0.8, 30)
    // Warm harvest wheat & fertile soil accents
    wash(600, 640, 160, 50, '#e9d8a6', 0.75, 25)
    wash(860, 650, 180, 50, '#ee9b00', 0.7, 25)

    // ----------------- Pasture & Grazing Cattle (Bottom Right: 1220 to 1600, 640 to 800)
    wash(1420, 740, 220, 70, '#70e000', 0.85, 35)
    wash(1340, 760, 180, 60, '#38b000', 0.85, 30)
    wash(1520, 750, 160, 60, '#80b918', 0.85, 30)
    // Cow and calf coat: warm golden cream with chestnut patches
    wash(1390, 720, 90, 45, '#f5ebe0', 0.9, 18)
    wash(1380, 715, 50, 30, '#b08968', 0.85, 14)
    wash(1560, 725, 45, 25, '#ede0d4', 0.9, 14)

    return off
  }, [])

  // Initialize offscreen master and mask canvases
  useEffect(() => {
    offscreenRef.current = createWatercolorMaster()

    const mask = document.createElement('canvas')
    mask.width = WIDTH
    mask.height = HEIGHT
    const mctx = mask.getContext('2d')
    if (mctx) {
      mctx.fillStyle = '#000000'
      mctx.fillRect(0, 0, WIDTH, HEIGHT)
    }
    maskRef.current = mask
  }, [createWatercolorMaster])

  // Continuous animation frame render
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    const mask = maskRef.current
    const off = offscreenRef.current
    if (!canvas || !mask || !off) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Draw accumulated mask into onscreen canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    // If fully colored, draw full master
    if (isFullyColored) {
      ctx.globalAlpha = 1
      ctx.drawImage(off, 0, 0)
      return
    }

    // Temporary composite canvas to combine mask + active cursor spotlight
    ctx.drawImage(mask, 0, 0)

    // Also draw dynamic active cursor spotlight halo
    const active = activePointRef.current
    if (active.active) {
      const haloRadius = 220
      const hGrad = ctx.createRadialGradient(active.x, active.y, 0, active.x, active.y, haloRadius)
      hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      hGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.75)')
      hGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.35)')
      hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = hGrad
      ctx.beginPath()
      ctx.arc(active.x, active.y, haloRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Composite offscreen master with 'source-in'
    ctx.globalCompositeOperation = 'source-in'
    ctx.drawImage(off, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
  }, [isFullyColored])

  // Animation frame loop
  useEffect(() => {
    const loop = () => {
      renderFrame()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [renderFrame])

  // Paint a stroke onto the mask
  const paintStroke = useCallback((x: number, y: number) => {
    const mask = maskRef.current
    if (!mask || isFullyColored) return
    const mctx = mask.getContext('2d')
    if (!mctx) return

    const brushRadius = 160
    const grad = mctx.createRadialGradient(x, y, 0, x, y, brushRadius)
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)')
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.25)')
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

    mctx.fillStyle = grad
    mctx.beginPath()
    mctx.arc(x, y, brushRadius, 0, Math.PI * 2)
    mctx.fill()

    dirtyRef.current = true
  }, [isFullyColored])

  // Pointer move handler (tracks movement relative to container)
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Relative coordinates
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top

    // Check if pointer is within or close to the container
    if (relX < -80 || relX > rect.width + 80 || relY < -80 || relY > rect.height + 80) {
      activePointRef.current.active = false
      lastPointRef.current = null
      return
    }

    // Map to 1600 x 800 internal coordinates
    const curX = Math.max(0, Math.min(WIDTH, (relX / rect.width) * WIDTH))
    const curY = Math.max(0, Math.min(HEIGHT, (relY / rect.height) * HEIGHT))

    activePointRef.current = { x: curX, y: curY, active: true }

    // Interpolate strokes between lastPoint and current to prevent gaps during fast swipes
    const last = lastPointRef.current
    if (last) {
      const dx = curX - last.x
      const dy = curY - last.y
      const dist = Math.hypot(dx, dy)
      const steps = Math.max(1, Math.floor(dist / 45))
      for (let i = 1; i <= steps; i++) {
        paintStroke(last.x + (dx * i) / steps, last.y + (dy * i) / steps)
      }
    } else {
      paintStroke(curX, curY)
    }

    lastPointRef.current = { x: curX, y: curY }
  }, [paintStroke])

  const handlePointerLeave = useCallback(() => {
    activePointRef.current.active = false
    lastPointRef.current = null
  }, [])

  // Global window pointer listener so moving over the hero section seamlessly colors the landscape
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [handlePointerMove, handlePointerLeave])

  // "Color All" action to reveal the entire landscape in full watercolor
  const colorAll = () => {
    setIsFullyColored(true)
    setFillPercent(100)
  }

  // "Reset" action to restore the pure monochrome hand-drawn sketch
  const resetCanvas = () => {
    setIsFullyColored(false)
    const mask = maskRef.current
    if (mask) {
      const mctx = mask.getContext('2d')
      if (mctx) {
        mctx.clearRect(0, 0, WIDTH, HEIGHT)
      }
    }
    setFillPercent(0)
  }

  return (
    <div
      ref={containerRef}
      className={`hero-colorizer absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* 60fps Watercolor Canvas: blends with ink sketch via multiply */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full h-full object-cover transition-opacity duration-700 pointer-events-none"
        style={{
          mixBlendMode: 'multiply',
          opacity: 0.95,
          filter: 'contrast(1.05) saturate(1.15)',
        }}
      />

      {/* Interactive Sketchbook Pill: Let users see the mode, Color All, or Reset */}
      <div className="absolute right-4 bottom-4 z-20 pointer-events-auto flex items-center gap-2 font-mono text-xs no-print">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fcfaf5]/90 border border-ink text-ink shadow-[2px_2px_0_#1a3300] backdrop-blur-sm">
          <span>🎨</span>
          <span className="font-semibold">{isFullyColored ? 'Fully Colored' : 'Move cursor to color in'}</span>
        </span>
        {isFullyColored ? (
          <button
            type="button"
            onClick={resetCanvas}
            className="px-2.5 py-1.5 rounded-full bg-yellow border border-ink text-ink font-bold shadow-[2px_2px_0_#1a3300] hover:translate-y-[-1px] active:translate-y-[1px] transition-transform text-xs"
            title="Reset to black and white sketch"
          >
            ↺ Reset
          </button>
        ) : (
          <button
            type="button"
            onClick={colorAll}
            className="px-2.5 py-1.5 rounded-full bg-[#d5f5c2] border border-ink text-ink font-bold shadow-[2px_2px_0_#1a3300] hover:translate-y-[-1px] active:translate-y-[1px] transition-transform text-xs"
            title="Fill whole illustration with color"
          >
            ✦ Color All
          </button>
        )}
      </div>
    </div>
  )
}
