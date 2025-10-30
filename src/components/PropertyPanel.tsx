import type { CustomerType, PropertyInfo } from '../types/inbox'
import { useEffect, useMemo, useState } from 'react'
import { searchBookingsByGuest, type BookingDetails } from '../services/bookingService'

interface Props {
  property?: PropertyInfo
  guestName?: string
  customerType?: CustomerType
  externalActiveTab?: 'details' | 'booking' | 'promotions'
  onCollapse?: () => void
  onSharePromotion?: (text: string, send?: boolean) => void
}

export default function PropertyPanel({ property, guestName, customerType, externalActiveTab, onCollapse, onSharePromotion }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'booking' | 'promotions'>('details')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<BookingDetails | undefined>(undefined)
  const [past, setPast] = useState<BookingDetails[]>([])
  const canSearch = useMemo(() => query.trim().length > 0, [query])
  const onSearch = async () => {
    if (!canSearch) return
    setLoading(true)
    try {
      const res = await searchBookingsByGuest(query)
      setCurrent(res.current)
      setPast(res.past)
    } finally {
      setLoading(false)
    }
  }
  // Respond to external tab change
  useEffect(() => {
    if (externalActiveTab) setActiveTab(externalActiveTab)
  }, [externalActiveTab])
  // Auto-search when guestName available
  useEffect(() => {
    if (!guestName) return
    setQuery(guestName)
    ;(async () => {
      setLoading(true)
      try {
        const res = await searchBookingsByGuest(guestName)
        setCurrent(res.current)
        setPast(res.past)
        setActiveTab('booking')
      } finally {
        setLoading(false)
      }
    })()
  }, [guestName])
  return (
    <aside className="h-full w-full overflow-y-auto border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property</h2>
        {onCollapse && (
          <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={onCollapse} title="Hide property panel">Hide</button>
        )}
      </div>
      <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-800">
        <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <button
            className={`px-3 py-1 text-xs ${activeTab==='details'?'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100':'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveTab('details')}
          >Details</button>
          <button
            className={`px-3 py-1 text-xs border-l border-gray-200 dark:border-gray-800 ${activeTab==='booking'?'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100':'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveTab('booking')}
          >Search booking</button>
          <button
            className={`px-3 py-1 text-xs border-l border-gray-200 dark:border-gray-800 ${activeTab==='promotions'?'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100':'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setActiveTab('promotions')}
          >Promotions</button>
        </div>
      </div>
      {!property ? (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No property selected</div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Hotel gallery */}
          <Gallery propertyName={property.name} />

          {activeTab === 'details' && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overview</p>
            <div className="mt-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{property.name}</p>
              {(property.rating || property.reviewsCount) && (
                <p className="mt-0.5 text-sm text-gray-600">
                  {property.rating ? `★ ${property.rating.toFixed(1)}` : ''}
                  {property.reviewsCount ? ` • ${property.reviewsCount.toLocaleString()} reviews` : ''}
                </p>
              )}
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">Address:</span> {property.address}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">Contact:</span> {property.contact}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  {property.website && (
                    <a className="text-indigo-700 underline" href={property.website} target="_blank" rel="noreferrer">Website</a>
                  )}
                  {property.email && (
                    <a className="text-indigo-700 underline" href={`mailto:${property.email}`}>{property.email}</a>
                  )}
                  {property.timezone && <span className="text-gray-500">TZ: {property.timezone}</span>}
                </div>
              </div>
            </div>
          </section>
          )}
          {activeTab === 'promotions' && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Promotions</p>
              {!property.promotions || property.promotions.length === 0 ? (
                <div className="text-sm text-gray-500">No promotions available.</div>
              ) : (
                <ul className="space-y-2">
                  {property.promotions.map((p, idx) => {
                    const now = Date.now()
                    const start = new Date(p.start).getTime()
                    const end = new Date(p.end).getTime()
                    let badge = 'Upcoming'
                    let badgeCls = 'bg-gray-100 text-gray-700'
                    if (now >= start && now <= end) { badge = 'Active'; badgeCls = 'bg-emerald-100 text-emerald-700' }
                    if (now > end) { badge = 'Expired'; badgeCls = 'bg-rose-100 text-rose-700' }
                    const msg = `Promotion: ${p.title} (code ${p.code}). Valid ${new Date(p.start).toLocaleDateString()} – ${new Date(p.end).toLocaleDateString()}${p.description?`. ${p.description}`:''}`
                    return (
                      <li key={idx} className="rounded-md border border-gray-100 dark:border-gray-800 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.title}</div>
                            <div className="text-xs text-gray-500">Code: <span className="font-mono">{p.code}</span></div>
                            {p.description && <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{p.description}</div>}
                          </div>
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] ${badgeCls}`}>{badge}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{new Date(p.start).toLocaleDateString()} – {new Date(p.end).toLocaleDateString()}</div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => onSharePromotion?.(msg, false)}
                            title="Insert promotion into reply"
                          >Insert into reply</button>
                          <button
                            className="rounded-md bg-indigo-600 text-white px-2 py-1 text-xs hover:bg-indigo-700"
                            onClick={() => onSharePromotion?.(msg, true)}
                            title="Send promotion now"
                            disabled={badge === 'Expired'}
                          >Send</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}
          {activeTab === 'details' && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Rooms & Rates</p>
            <ul className="space-y-2 text-sm">
              {property.rooms.map((r) => (
                <li key={r.name} className="flex items-center justify-between rounded-md border border-gray-100 dark:border-gray-800 p-2 hover:bg-gray-50/60 dark:hover:bg-gray-900/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <RoomImage roomName={r.name} />
                    <span className="truncate font-medium text-gray-900 dark:text-gray-100">{r.name}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.price}</span>
                </li>
              ))}
            </ul>
          </section>
          )}
          {activeTab === 'details' && property.restaurants && property.restaurants.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Dining & Restaurants</p>
              <ul className="space-y-1 text-sm">
                {property.restaurants.map((r, idx) => (
                  <li key={`${r.type}-${idx}`} className="flex justify-between">
                    <span>{r.type}</span>
                    <span className="text-gray-500 dark:text-gray-400">{r.hours}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {activeTab === 'details' && property.amenities && property.amenities.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">{a}</span>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'details' && (property.poolHours || property.parking) && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Facilities</p>
              <div className="space-y-1 text-sm">
                {property.poolHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Pool</span>
                    <span className="text-gray-500 dark:text-gray-400">{property.poolHours}</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Parking</span>
                    <span className="text-gray-500 dark:text-gray-400">{property.parking}</span>
                  </div>
                )}
              </div>
            </section>
          )}
          {activeTab === 'details' && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Policies</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check-in {property.policies.checkIn} • Check-out {property.policies.checkOut}</p>
          </section>
          )}
          {activeTab === 'booking' && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Search booking</p>
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
                  placeholder="Enter guest name (e.g., Liza)"
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  disabled={!canSearch || loading}
                  onClick={onSearch}
                  className="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm hover:bg-indigo-700 disabled:opacity-50"
                >{loading ? 'Searching…' : 'Search'}</button>
              </div>
              <div className="mt-4">
                {current ? (
                  <div className="space-y-2 text-sm">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Current booking</div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Booking ID</span><span className="font-medium">{current.id}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Guest</span><span className="font-medium">{current.guestName}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Check-in</span><span className="font-medium">{new Date(current.checkIn).toLocaleString()}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Check-out</span><span className="font-medium">{new Date(current.checkOut).toLocaleString()}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Room</span><span className="font-medium">{current.roomType}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="font-medium capitalize">{current.status.replace('_',' ')}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{current.amount}</span></div>
                    {current.notes && <div className="text-gray-600 dark:text-gray-300">{current.notes}</div>}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{loading ? '' : 'No booking found'}</div>
                )}
                {customerType === 'member' && past.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Past bookings</div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                      {past.map((b) => (
                        <li key={b.id} className="py-2 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{b.id}</div>
                            <div className="text-gray-500">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} • {b.roomType}</div>
                          </div>
                          <div className="text-right">
                            <div className="capitalize text-gray-700 dark:text-gray-300">{b.status.replace('_',' ')}</div>
                            <div className="text-gray-500">{b.amount}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </aside>
  )
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function Gallery({ propertyName }: { propertyName: string }) {
  const slug = slugify(propertyName)
  // Candidate images placed in public/hotels/<slug>/
  const lower = [
    `/${'hotels'}/${slug}/hero.jpg`,
    `/${'hotels'}/${slug}/cover.jpg`,
    `/${'hotels'}/${slug}/1.jpg`,
    `/${'hotels'}/${slug}/2.jpg`,
    `/${'hotels'}/${slug}/3.jpg`,
    `/${'hotels'}/${slug}/4.jpg`,
    `/${'hotels'}/${slug}/5.jpg`,
  ]
  const upper = [
    `/${'Hotels'}/${slug}/hero.jpg`,
    `/${'Hotels'}/${slug}/cover.jpg`,
    `/${'Hotels'}/${slug}/1.jpg`,
    `/${'Hotels'}/${slug}/2.jpg`,
    `/${'Hotels'}/${slug}/3.jpg`,
    `/${'Hotels'}/${slug}/4.jpg`,
    `/${'Hotels'}/${slug}/5.jpg`,
  ]
  const candidates = [...lower, ...upper]
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Gallery</p>
      <div className="relative w-full overflow-hidden rounded-md border border-gray-100 dark:border-gray-800">
        <div className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar">
          {candidates.map((src, idx) => (
            <HeroImage key={idx} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {candidates.slice(2).map((src, idx) => (
          <ThumbImage key={idx} src={src} />
        ))}
      </div>
    </section>
  )
}

function HeroImage({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <img
      src={src}
      alt="Hotel image"
      onError={() => setHidden(true)}
      className="h-48 w-full flex-none snap-center object-cover"
    />
  )
}

function ThumbImage({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <img
      src={src}
      alt="Hotel thumbnail"
      onError={() => setHidden(true)}
      className="h-16 w-full object-cover rounded"
    />
  )
}

function RoomImage({ roomName }: { roomName: string }) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return <div className="h-12 w-16 rounded bg-gray-100 dark:bg-gray-800" />
  const key = roomName.toLowerCase()
  let file = ''
  if (key.includes('deluxe')) file = 'deluxe.jpg'
  else if (key.includes('suite')) file = 'suite.jpg'
  else if (key.includes('standard')) file = 'standard.jpg'
  else if (key.includes('cabin')) file = 'cabin.jpg'
  else file = 'standardroom.jpg'
  const src = `/${'Room'}/${file}`
  return (
    <img
      src={src}
      alt={roomName}
      onError={() => setHidden(true)}
      className="h-12 w-16 rounded object-cover"
    />
  )
}

