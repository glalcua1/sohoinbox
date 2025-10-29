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
  if (thread.guest) return thread
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
    },
  }
}

function enrichThreads(threads: Thread[]): Thread[] {
  return threads.map(inferGuestFromThread)
}

function migrateThreads(threads: Thread[]): { threads: Thread[]; changed: boolean } {
  let changed = false
  const updated = threads.map((t) => {
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
    if (tChanged) {
      changed = true
      return { ...t, messages: newMessages }
    }
    return t
  })
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

// Placeholder for future real API base URL
export const API_BASE = import.meta.env.VITE_API_BASE as string | undefined
