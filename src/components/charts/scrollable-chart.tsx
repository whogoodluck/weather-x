import React, { useRef, useState, useCallback, useEffect } from 'react'

interface ScrollableChartProps {
  children: React.ReactNode
  minWidth?: number
  height?: number
  className?: string
}

export function ScrollableChart({
  children,
  minWidth = 800,
  height = 220,
  className = '',
}: ScrollableChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 4)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), [])
  const zoomReset = useCallback(() => setZoom(1), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.5), 4))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const chartWidth = minWidth * zoom

  return (
    <div className={`relative ${className}`}>
      <div className='absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg border border-border bg-background/90 px-2 py-1 shadow-sm backdrop-blur'>
        <button
          onClick={zoomOut}
          className='flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-muted-foreground transition-colors hover:text-foreground'
          title='Zoom out'
        >
          −
        </button>
        <button
          onClick={zoomReset}
          className='px-1 text-[10px] text-muted-foreground tabular-nums transition-colors hover:text-foreground'
          title='Reset zoom'
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={zoomIn}
          className='flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-muted-foreground transition-colors hover:text-foreground'
          title='Zoom in'
        >
          +
        </button>
      </div>

      <div
        ref={containerRef}
        className='scrollbar-thin-custom overflow-x-auto overflow-y-hidden'
        style={{ cursor: 'grab' }}
      >
        <div style={{ width: chartWidth, minWidth: chartWidth, height }}>
          {children}
        </div>
      </div>
    </div>
  )
}
