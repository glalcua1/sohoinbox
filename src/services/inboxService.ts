// src/services/inboxService.ts
import type { Thread } from '../types/inbox'
import { mockThreads } from '../data/mockThreads'

const STORAGE_KEY = 'inbox_threads_v5'

function readStoredThreads(): Thread[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Thread[]
  } catch {
    return null
  }
}

function writeStoredThreads(threads: Thread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
  } catch {
    // Ignore storage write errors (e.g., privacy mode)
  }
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

function inferGuestFromThread(thread: Thread): Thread {
  if (thread.guest) {
    // Ensure default customerType when missing
    if (!thread.guest.customerType) {
      return { ...thread, guest: { ...thread.guest, customerType: 'regular' } }
    }
    return thread
  }
  const inbound = thread.messages.find((m) => m.inbound)
  if (!inbound) return thread
  const name = inbound.senderName || 'Guest'
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return {
    ...thread,
    guest: {
      name,
      username: slug || undefined,
      avatarUrl: `/avatars/${slug}.svg`,
      customerType: 'regular',
    },
  }
}

function enrichThreads(threads: Thread[]): Thread[] {
  return threads.map(inferGuestFromThread)
}

function migrateThreads(threads: Thread[]): { threads: Thread[]; changed: boolean } {
  let changed = false
  let updated = threads.map((t) => {
    let tChanged = false
    // Migrate Rahul -> Liza in guest
    if (t.guest && t.guest.name === 'Rahul') {
      t = {
        ...t,
        guest: {
          ...t.guest,
          name: 'Liza',
          username: 'liza-travel',
          avatarUrl: '/avatars/liza.svg',
        },
      }
      tChanged = true
    }
    // Migrate messages senderName
    const newMessages = t.messages.map((m) =>
      m.senderName === 'Rahul' ? { ...m, senderName: 'Liza' } : m
    )
    if (newMessages !== t.messages) tChanged = true
    // Seed customerType for known guests if missing or defaulted to 'regular'
    if (t.guest) {
      const mapping: Record<string, 'regular' | 'member' | 'vip'> = {
        Priya: 'vip',
        Arjun: 'member',
        Riya: 'member',
        Liza: 'member',
        Leena: 'vip',
      }
      const current = t.guest.customerType
      const desired = mapping[t.guest.name]
      if (desired && current !== desired) {
        t = { ...t, guest: { ...t.guest, customerType: desired } }
        tChanged = true
      }
    }
    if (tChanged) {
      changed = true
      return { ...t, messages: newMessages }
    }
    return t
  })
  // Ensure property promotions exist for known properties
  const byProperty: Record<string, Thread['property']['promotions']> = {
    'CityCenter Hotel': [
      { title: 'Spring Sale 20% off', code: 'SPRING20', start: '2025-03-01T00:00:00.000Z', end: '2025-05-31T23:59:59.000Z', description: 'Use before end of May' },
      { title: 'Weekend Saver 10% off', code: 'WEEKEND10', start: '2025-01-01T00:00:00.000Z', end: '2025-12-31T23:59:59.000Z', description: 'Fri–Sun stays only' },
    ],
    'OceanView Resort': [
      { title: 'Monsoon Getaway 20% off', code: 'MONSOON20', start: '2025-06-01T00:00:00.000Z', end: '2025-08-31T23:59:59.000Z', description: 'Min 2 nights' },
      { title: 'Festive Offer 15% off', code: 'FESTIVE15', start: '2025-10-15T00:00:00.000Z', end: '2026-01-10T23:59:59.000Z', description: 'Breakfast included' },
    ],
    'MountainPeak Lodge': [
      { title: 'Hikers Special 12% off', code: 'HIKE12', start: '2025-02-01T00:00:00.000Z', end: '2025-11-30T23:59:59.000Z', description: 'Complimentary trail map' },
    ],
  }
  updated = updated.map((t) => {
    if (!t.property.promotions && byProperty[t.property.name]) {
      changed = true
      return { ...t, property: { ...t.property, promotions: byProperty[t.property.name] } }
    }
    return t
  })
  // Canonicalize property details by hotel name to ensure consistency across threads
  const canonical: Record<string, Thread['property']> = {
    'CityCenter Hotel': {
      name: 'CityCenter Hotel',
      address: '456 Downtown Ave',
      contact: '+1 (555) 987-6543',
      rating: 4.1,
      reviewsCount: 842,
      amenities: ['Free Wi‑Fi', 'Gym', 'Bar'],
      timezone: 'Asia/Kolkata',
      website: 'https://citycenter.example',
      email: 'hello@citycenter.example',
      restaurants: [
        { type: 'All‑day Café', hours: '6:30AM–11PM' },
        { type: 'Lobby Bar', hours: '5PM–1AM' },
      ],
      parking: 'Basement self‑parking, ₹200/hour; valet available',
      rooms: [
        { name: 'Standard', price: '₹5,500' },
        { name: 'Executive', price: '₹9,500' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
      promotions: byProperty['CityCenter Hotel'],
    },
    'OceanView Resort': {
      name: 'OceanView Resort',
      address: '123 Beach Rd',
      contact: '+1 (555) 123-4567',
      rating: 4.6,
      reviewsCount: 1287,
      amenities: ['Pool', 'Spa', 'Gym', 'Free Wi‑Fi', 'Breakfast'],
      timezone: 'Asia/Kolkata',
      website: 'https://oceanview.example',
      email: 'contact@oceanview.example',
      restaurants: [
        { type: 'Multi‑cuisine Restaurant', hours: '7AM–11PM' },
        { type: 'Seafood Bar', hours: '5PM–12AM' },
      ],
      poolHours: '6AM–10PM',
      parking: 'On‑site parking, complimentary valet',
      rooms: [
        { name: 'Deluxe', price: '₹8,000' },
        { name: 'Suite', price: '₹12,000' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
      promotions: byProperty['OceanView Resort'],
    },
    'MountainPeak Lodge': {
      name: 'MountainPeak Lodge',
      address: '789 Summit Dr',
      contact: '+1 (555) 555-0000',
      rating: 4.4,
      reviewsCount: 621,
      amenities: ['Cabins', 'Hiking Trails', 'Fireplace'],
      timezone: 'Asia/Kolkata',
      website: 'https://mountainpeak.example',
      email: 'stay@mountainpeak.example',
      restaurants: [
        { type: 'Local Cuisine Restaurant', hours: '7:30AM–10PM' },
        { type: 'Coffee House', hours: '7AM–9PM' },
      ],
      parking: 'Outdoor self‑parking, free',
      rooms: [
        { name: 'Cabin', price: '₹7,000' },
        { name: 'Suite', price: '₹11,000' },
      ],
      policies: { checkIn: '3PM', checkOut: '10AM' },
      promotions: byProperty['MountainPeak Lodge'],
    },
  }

  function mergePromotions(a?: Thread['property']['promotions'], b?: Thread['property']['promotions']) {
    const map = new Map<string, NonNullable<Thread['property']['promotions']>[number]>()
    ;(a || []).forEach((p) => map.set(p.code, p))
    ;(b || []).forEach((p) => map.set(p.code, p))
    return Array.from(map.values())
  }

  updated = updated.map((t) => {
    const canon = canonical[t.property.name]
    if (!canon) return t
    const merged: Thread['property'] = {
      ...canon,
      // Keep any additional fields already present on thread property that canonical may not include
      ...t.property,
      // But enforce canonical baseline for shared fields by re-spreading canon:
      name: canon.name,
      address: canon.address,
      contact: canon.contact,
      rating: canon.rating,
      reviewsCount: canon.reviewsCount,
      amenities: canon.amenities,
      timezone: canon.timezone,
      website: canon.website,
      email: canon.email,
      restaurants: canon.restaurants,
      poolHours: canon.poolHours,
      parking: canon.parking,
      rooms: canon.rooms,
      policies: canon.policies,
      promotions: mergePromotions(canon.promotions, t.property.promotions),
    }
    const changedHere = JSON.stringify(merged) !== JSON.stringify(t.property)
    if (changedHere) {
      changed = true
      return { ...t, property: merged }
    }
    return t
  })
  // Add promotion scenario thread if missing
  if (!updated.find((t) => t.id === 't8')) {
    const now = new Date()
    const isoNow = now.toISOString()
    const promoThread: Thread = {
      id: 't8',
      platform: 'facebook',
      threadTitle: 'Did not get promo discount at CityCenter',
      lastUpdated: isoNow,
      status: 'open',
      guest: {
        name: 'Anita', username: 'anita.travel', location: 'Mumbai, IN', language: 'en-IN', avatarUrl: '/avatars/leena.svg', customerType: 'member',
      },
      ai: {
        summary: 'Guest claims SPRING20 was not applied during booking.',
        sentiment: 'negative',
        tags: ['promotion', 'discount', 'billing'],
        suggestedReplies: [
          'I’m sorry this happened. May I confirm your booking ID to check the code?',
          'We’ll honor SPRING20 if eligible. I can apply the difference right away.',
          'The code works for stays till May 31 and select room types. I’ll verify yours.',
        ],
      } as any,
      property: {
        name: 'CityCenter Hotel', address: '456 Downtown Ave', contact: '+1 (555) 987-6543', rooms: [
          { name: 'Standard', price: '₹5,500' }, { name: 'Executive', price: '₹9,500' },
        ], policies: { checkIn: '2PM', checkOut: '11AM' }, promotions: byProperty['CityCenter Hotel'],
      },
      messages: [
        { id: `m${Date.now()}`, threadId: 't8', platform: 'facebook', senderName: 'Anita', text: 'I used SPRING20 but got charged full price.', timestamp: isoNow, inbound: true },
      ],
    }
    updated = [promoThread, ...updated]
    changed = true
  }
  return { threads: updated, changed }
}

export async function getThreads(): Promise<Thread[]> {
  if (API_BASE) {
    try {
      const apiThreads = await fetchJson<Thread[]>(`${API_BASE}/threads`)
      if (Array.isArray(apiThreads) && apiThreads.length > 0) {
        const enriched = enrichThreads(apiThreads)
        const migrated = migrateThreads(enriched)
        return migrated.threads
      }
    } catch {
      // fall through to local
    }
  }
  const existing = readStoredThreads()
  if (existing && existing.length) {
    const enriched = enrichThreads(existing)
    const migrated = migrateThreads(enriched)
    if (migrated.changed) await setThreads(migrated.threads)
    return migrated.threads
  }
  const seeded = enrichThreads(mockThreads)
  writeStoredThreads(seeded)
  return seeded
}

export async function setThreads(next: Thread[]): Promise<void> {
  if (API_BASE) {
    // Not used in API mode
    return
  }
  writeStoredThreads(next)
}

export async function assignThreads(
  threadIds: string[],
  assignment: { assignee: string; department?: string; priority: 'low'|'medium'|'high' } | undefined
): Promise<Thread[]> {
  if (API_BASE) {
    await Promise.all(
      threadIds.map((id) =>
        fetch(`${API_BASE}/threads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment }),
        })
      )
    )
    return await getThreads()
  }
  const threads = await getThreads()
  const updated = threads.map((t) => (threadIds.includes(t.id) ? { ...t, assignment } : t))
  await setThreads(updated)
  return updated
}

export async function updateThread(threadId: string, updater: (t: Thread) => Thread): Promise<Thread[]> {
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const next = updater(current)
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    return await getThreads()
  }
  const threads = await getThreads()
  const updated = threads.map((t) => (t.id === threadId ? updater(t) : t))
  await setThreads(updated)
  return updated
}

export async function addTag(threadId: string, tag: string): Promise<Thread[]> {
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const tags = Array.from(new Set([...(current.ai.tags || []), tag]))
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai: { ...current.ai, tags } }),
    })
    return await getThreads()
  }
  return updateThread(threadId, (t) => ({
    ...t,
    ai: { ...t.ai, tags: Array.from(new Set([...(t.ai.tags || []), tag])) },
  }))
}

export async function removeTag(threadId: string, tag: string): Promise<Thread[]> {
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const tags = (current.ai.tags || []).filter((x) => x.toLowerCase() !== tag.toLowerCase())
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai: { ...current.ai, tags } }),
    })
    return await getThreads()
  }
  return updateThread(threadId, (t) => ({
    ...t,
    ai: { ...t.ai, tags: (t.ai.tags || []).filter((x) => x.toLowerCase() !== tag.toLowerCase()) },
  }))
}

export async function addOutboundMessage(threadId: string, text: string): Promise<Thread[]> {
  const createMessage = (t: Thread) => ({
    id: `m${Date.now()}`,
    threadId: t.id,
    platform: t.platform,
    senderName: 'Agent',
    text,
    timestamp: new Date().toISOString(),
    inbound: false,
  })
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const next = {
      ...current,
      lastUpdated: new Date().toISOString(),
      messages: [...current.messages, createMessage(current)],
    }
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    return await getThreads()
  }
  return updateThread(threadId, (t) => ({
    ...t,
    lastUpdated: new Date().toISOString(),
    messages: [...t.messages, createMessage(t)],
  }))
}

export async function addOutboundAttachment(
  threadId: string,
  attachments: Array<{ id?: string; type: 'image'; url: string; alt?: string }>,
  text?: string
): Promise<Thread[]> {
  const createMessage = (t: Thread) => ({
    id: `m${Date.now()}`,
    threadId: t.id,
    platform: t.platform,
    senderName: 'Agent',
    text: text ?? '',
    timestamp: new Date().toISOString(),
    inbound: false,
    attachments: attachments.map((a, idx) => ({ id: a.id ?? `att-${Date.now()}-${idx}` , type: a.type, url: a.url, alt: a.alt })),
  })
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const next = {
      ...current,
      lastUpdated: new Date().toISOString(),
      messages: [...current.messages, createMessage(current)],
    }
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    return await getThreads()
  }
  return updateThread(threadId, (t) => ({
    ...t,
    lastUpdated: new Date().toISOString(),
    messages: [...t.messages, createMessage(t)],
  }))
}

export async function deleteMessage(threadId: string, messageId: string): Promise<Thread[]> {
  if (API_BASE) {
    const current = (await getThreads()).find((t) => t.id === threadId)
    if (!current) return await getThreads()
    const next = {
      ...current,
      messages: current.messages.filter((m) => m.id !== messageId),
    }
    await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    return await getThreads()
  }
  return updateThread(threadId, (t) => ({
    ...t,
    messages: t.messages.filter((m) => m.id !== messageId),
  }))
}

// Placeholder for future real API base URL
export const API_BASE = import.meta.env.VITE_API_BASE as string | undefined
