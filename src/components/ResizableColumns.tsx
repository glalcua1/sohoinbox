import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  left: ReactNode
  center: ReactNode
  right: ReactNode
  minLeftPx?: number
  minCenterPx?: number
  minRightPx?: number
  defaultWidths?: { leftPct: number; centerPct: number; rightPct: number }
  storageKey?: string
  hideRight?: boolean
  onExpandRight?: () => void
}

export default function ResizableColumns({
  left,
  center,
  right,
  minLeftPx = 280,
  minCenterPx = 480,
  minRightPx = 260,
  defaultWidths = { leftPct: 27, centerPct: 46, rightPct: 27 },
  storageKey = 'inbox_col_widths',
  hideRight = false,
  onExpandRight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [widths, setWidths] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw) as { leftPct: number; centerPct: number; rightPct: number }
    } catch {}
    return defaultWidths
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(widths))
    } catch {}
  }, [storageKey, widths])

  const startDrag = useRef<null | {
    which: 1 | 2
    startX: number
    leftPct: number
    centerPct: number
    rightPct: number
    containerW: number
  }>(null)

  const onMouseMove = useCallback((e: MouseEvent) => {
    const ctx = startDrag.current
    if (!ctx) return
    const dx = e.clientX - ctx.startX
    const dxPct = (dx / ctx.containerW) * 100

    if (ctx.which === 1) {
      // move between left and center
      let newLeft = ctx.leftPct + dxPct
      let newCenter = ctx.centerPct - dxPct
      // enforce minimums
      const minLeftPct = (ctx.containerW > 0 ? (minLeftPx / ctx.containerW) * 100 : 0)
      const minCenterPct = (ctx.containerW > 0 ? (minCenterPx / ctx.containerW) * 100 : 0)
      if (newLeft < minLeftPct) {
        newCenter -= minLeftPct - newLeft
        newLeft = minLeftPct
      }
      if (newCenter < minCenterPct) {
        newLeft -= minCenterPct - newCenter
        newCenter = minCenterPct
      }
      setWidths((w) => ({ ...w, leftPct: clampPct(newLeft), centerPct: clampPct(newCenter) }))
    } else {
      // move between center and right
      if (hideRight) return
      let newCenter = ctx.centerPct + dxPct
      let newRight = ctx.rightPct - dxPct
      const minCenterPct = (ctx.containerW > 0 ? (minCenterPx / ctx.containerW) * 100 : 0)
      const minRightPct = (ctx.containerW > 0 ? (minRightPx / ctx.containerW) * 100 : 0)
      if (newCenter < minCenterPct) {
        newRight -= minCenterPct - newCenter
        newCenter = minCenterPct
      }
      if (newRight < minRightPct) {
        newCenter -= minRightPct - newRight
        newRight = minRightPct
      }
      setWidths((w) => ({ ...w, centerPct: clampPct(newCenter), rightPct: clampPct(newRight) }))
    }
  }, [minCenterPx, minLeftPx, minRightPx, hideRight])

  const onMouseUp = useCallback(() => {
    if (startDrag.current) {
      startDrag.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove])

  const begin = (which: 1 | 2) => (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const containerW = rect?.width || 0
    startDrag.current = {
      which,
      startX: e.clientX,
      leftPct: widths.leftPct,
      centerPct: widths.centerPct,
      rightPct: widths.rightPct,
      containerW,
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const reset = () => setWidths(defaultWidths)

  // compute effective widths when right is hidden
  const effective = hideRight
    ? { leftPct: widths.leftPct, centerPct: clampPct(100 - widths.leftPct), rightPct: 0 }
    : widths

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden bg-white">
      <section
        className="h-full overflow-hidden border-r border-gray-200"
        style={{ width: `${effective.leftPct}%`, minWidth: minLeftPx }}
      >
        <div className="h-full overflow-auto">{left}</div>
      </section>

      <Handle onMouseDown={begin(1)} onDoubleClick={reset} />

      <section
        className="h-full overflow-hidden border-r border-gray-200"
        style={{ width: `${effective.centerPct}%`, minWidth: minCenterPx }}
      >
        <div className="h-full overflow-auto">{center}</div>
      </section>

      {hideRight ? (
        <button
          className="w-5 text-xs text-gray-500 hover:text-indigo-700"
          title="Expand property panel"
          onClick={onExpandRight}
        >
          ›
        </button>
      ) : (
        <>
          <Handle onMouseDown={begin(2)} onDoubleClick={reset} />
          <section
            className="h-full overflow-hidden"
            style={{ width: `${effective.rightPct}%`, minWidth: minRightPx }}
          >
            <div className="h-full overflow-auto">{right}</div>
          </section>
        </>
      )}
    </div>
  )
}

function Handle({ onMouseDown, onDoubleClick }: { onMouseDown: (e: React.MouseEvent) => void; onDoubleClick: () => void }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="w-1.5 cursor-col-resize bg-transparent hover:bg-indigo-200 active:bg-indigo-300 select-none"
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      title="Drag to resize • Double-click to reset"
    />
  )
}

function clampPct(n: number): number {
  if (n < 5) return 5
  if (n > 90) return 90
  return n
}


