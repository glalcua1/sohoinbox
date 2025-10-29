import type { PropertyInfo } from '../types/inbox'
import { useState } from 'react'

interface Props {
  property: PropertyInfo
}

function slugify(input: string): string {
  return input.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function makeCandidates(roomName: string): string[] {
  const base = roomName.trim()
  const lower = base.toLowerCase()
  const hyphen = lower.replace(/\s+/g, '-')
  const underscore = lower.replace(/\s+/g, '_')
  const nospace = lower.replace(/\s+/g, '')
  const slug = slugify(base)
  const extras = [
    `${hyphen}-room`, `room-${hyphen}`, `${slug}-room`, `room-${slug}`,
    `${underscore}-room`, `room-${underscore}`,
  ]
  const uniq = Array.from(new Set([base, lower, hyphen, underscore, nospace, slug, ...extras]))
  const exts = ['jpg', 'jpeg', 'png', 'webp']
  const paths: string[] = []
  for (const name of uniq) {
    for (const ext of exts) paths.push(`/Room/${encodeURIComponent(name)}.${ext}`)
  }
  return paths
}

function RoomImage({ roomName }: { roomName: string }) {
  const candidates = makeCandidates(roomName)
  const [idx, setIdx] = useState(0)
  const src = candidates[idx]
  return (
    <img
      src={src}
      alt={roomName}
      className="h-24 w-36 rounded object-cover bg-gray-100"
      onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
    />
  )
}

export default function RatesCard({ property }: Props) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const formatter: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  const makeDateLabel = (d: Date) => d.toLocaleDateString(undefined, formatter)
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Available Rooms</p>
          <p className="text-xs text-gray-500">{property.name}</p>
          <p className="text-[11px] text-gray-500">Rates for {makeDateLabel(today)} – {makeDateLabel(tomorrow)}</p>
        </div>
        <a
          className="text-xs text-indigo-600 hover:underline"
          href={property.website || '#'}
          target="_blank"
          rel="noreferrer"
        >
          View property
        </a>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {property.rooms.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-md border border-gray-100 p-2">
            <RoomImage roomName={r.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-600">{r.price} / night</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700">Book now</button>
                <button className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


