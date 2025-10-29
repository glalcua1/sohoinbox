import { useEffect, useMemo, useRef, useState } from 'react'
import ThreadListPanel from './components/ThreadListPanel'
import ThreadView from './components/ThreadView'
import PropertyPanel from './components/PropertyPanel'
import QuickReplyBar from './components/QuickReplyBar'
import TagFilterBar from './components/TagFilterBar'
import SearchBar from './components/SearchBar'
import type { Platform, Sentiment } from './types/inbox'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import BulkActionBar from './components/BulkActionBar'
import { addOutboundMessage, addTag, assignThreads, getThreads, removeTag } from './services/inboxService'
import type { Thread } from './types/inbox'
import Sidebar from './components/Sidebar'
import ResizableColumns from './components/ResizableColumns'

function App() {
  console.log('[soho-web] App render start')
  const [threads, setThreadsState] = useState<Thread[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [sentiment, setSentiment] = useState<Sentiment | 'all'>('all')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<string | 'all'>('all')
  const [sla, setSla] = useState<'all'|'delayed'|'on_time'>('all')
  const [reply, setReply] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('sidebar_collapsed')
      return raw ? JSON.parse(raw) : false
    } catch {
      return false
    }
  })
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('right_collapsed')
      return raw ? JSON.parse(raw) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    (async () => {
      try {
        const t = await getThreads()
        console.log('[soho-web] Loaded threads:', t.length)
        setThreadsState(t)
        setSelectedId(t[0]?.id)
      } catch (e) {
        console.error('[soho-web] getThreads failed', e)
      }
    })()
  }, [])

  // One-time UI migration to ensure property panel is hidden after this update
  useEffect(() => {
    try {
      const uiVersion = localStorage.getItem('ui_version')
      if (uiVersion !== '2') {
        setRightCollapsed(true)
        localStorage.setItem('right_collapsed', 'true')
        localStorage.setItem('ui_version', '2')
      }
    } catch {}
  }, [])

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedId),
    [threads, selectedId]
  )

  const filteredThreads = useMemo(() => {
    const isOverSla = (t: Thread): boolean => {
      const lastInbound = [...t.messages].reverse().find((m) => m.inbound)
      if (!lastInbound) return false
      const minutes = (Date.now() - new Date(lastInbound.timestamp).getTime()) / 60000
      const target = t.ai.sentiment === 'negative' ? 15 : 30
      return minutes > target && t.status !== 'resolved'
    }
    return threads.filter((t) => {
      if (sentiment !== 'all' && t.ai.sentiment !== sentiment) return false
      if (platform !== 'all' && t.platform !== platform) return false
      if (location !== 'all' && (t.guest?.location ?? '').toLowerCase() !== location.toLowerCase()) return false
      if (sla !== 'all') {
        const delayed = isOverSla(t)
        if (sla === 'delayed' && !delayed) return false
        if (sla === 'on_time' && delayed) return false
      }
      if (query) {
        const q = query.toLowerCase()
        const inTitle = t.threadTitle.toLowerCase().includes(q)
        const inMessages = t.messages.some((m) => m.text.toLowerCase().includes(q))
        const inTags = t.ai.tags.some((tag) => tag.toLowerCase().includes(q))
        if (!(inTitle || inMessages || inTags)) return false
      }
      return true
    })
  }, [threads, sentiment, platform, location, sla, query])

  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    for (const t of threads) {
      if (t.guest?.location) set.add(t.guest.location)
    }
    return Array.from(set).sort()
  }, [threads])

  useKeyboardShortcuts({
    focusSearch: () => searchRef.current?.focus(),
    startReply: () => setReply(selectedThread?.ai.suggestedReplies[0] ?? ''),
    assign: async () => {
      if (selectedThread) {
        const updated = await assignThreads([selectedThread.id], { assignee: 'Alex', department: 'Guest Relations', priority: 'medium' })
        setThreadsState(updated)
      }
    },
  })

  // removed unused refreshFromService

  return (
    <div className="flex h-screen w-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} activeKey="reputation" />
      <div className="flex w-full flex-col">
        <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-indigo-600"></div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reputation Management</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
              onClick={() => {
                setRightCollapsed((v) => {
                  const next = !v
                  try { localStorage.setItem('right_collapsed', JSON.stringify(next)) } catch {}
                  return next
                })
              }}
              title={rightCollapsed ? 'Show property panel' : 'Hide property panel'}
            >
              {rightCollapsed ? 'Show Property' : 'Hide Property'}
            </button>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">R: Reply • /: Search</div>
          </div>
        </nav>

        <div className="h-[calc(100vh-56px)]">
          <ResizableColumns
            left={
              <div className="flex h-full flex-col">
            <BulkActionBar
              count={selectedIds.size}
              onAssign={async (assignment) => {
                const updated = await assignThreads(Array.from(selectedIds), assignment)
                setThreadsState(updated)
              }}
              onClear={() => setSelectedIds(new Set())}
            />
            <SearchBar value={query} onChange={setQuery} ref={searchRef} />
            <TagFilterBar
              sentiment={sentiment}
              platform={platform}
              location={location}
              locations={locationOptions}
              sla={sla}
              onChange={(n) => {
                if (n.sentiment !== undefined) setSentiment(n.sentiment)
                if (n.platform !== undefined) setPlatform(n.platform)
                if (n.location !== undefined) setLocation(n.location)
                if (n.sla !== undefined) setSla(n.sla)
              }}
            />
                <div className="flex-1">
                  <ThreadListPanel
                    threads={filteredThreads}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    selectedIds={selectedIds}
                    onToggleSelect={(id) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(id)) next.delete(id)
                        else next.add(id)
                        return next
                      })
                    }}
                    onToggleSelectAll={(checked) => {
                      if (checked) setSelectedIds(new Set(filteredThreads.map((t) => t.id)))
                      else setSelectedIds(new Set())
                    }}
                  />
                </div>
              </div>
            }
            center={
              <div className="flex h-full flex-col">
                <ThreadView
                  thread={selectedThread}
                  onAssign={async (assignment) => {
                    if (!selectedThread) return
                    const updated = await assignThreads([selectedThread.id], assignment)
                    setThreadsState(updated)
                  }}
                  onAddTag={async (tag) => {
                    if (!selectedThread) return
                    const updated = await addTag(selectedThread.id, tag)
                    setThreadsState(updated)
                  }}
                  onRemoveTag={async (tag) => {
                    if (!selectedThread) return
                    const updated = await removeTag(selectedThread.id, tag)
                    setThreadsState(updated)
                  }}
                />
                <QuickReplyBar
                  suggestions={selectedThread?.ai.suggestedReplies ?? []}
                  value={reply}
                  onChange={setReply}
                  onSend={async () => {
                    if (!selectedThread || !reply.trim()) return
                    const updated = await addOutboundMessage(selectedThread.id, reply.trim())
                    setReply('')
                    setThreadsState(updated)
                  }}
                />
              </div>
            }
            right={<PropertyPanel property={selectedThread?.property} onCollapse={() => setRightCollapsed(true)} />}
            minLeftPx={320}
            minCenterPx={520}
            minRightPx={280}
            hideRight={rightCollapsed}
            onExpandRight={() => setRightCollapsed(false)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
