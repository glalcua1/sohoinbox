import { useEffect, useMemo, useRef, useState } from 'react'
import ThreadListPanel from './components/ThreadListPanel'
import ThreadView from './components/ThreadView'
import PropertyPanel from './components/PropertyPanel'
import QuickReplyBar from './components/QuickReplyBar'
import TagFilterBar from './components/TagFilterBar'
import SearchBar from './components/SearchBar'
import type { Platform, Sentiment, CustomerType } from './types/inbox'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import BulkActionBar from './components/BulkActionBar'
import { addOutboundMessage, addTag, assignThreads, getThreads, removeTag, updateThread, deleteMessage, addOutboundAttachment } from './services/inboxService'
import { translateText, applyTone } from './services/translationService'
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
  const [view, setView] = useState<'inbox' | 'archive'>('inbox')
  const searchRef = useRef<HTMLInputElement>(null)
  const [customerType, setCustomerType] = useState<CustomerType | 'all'>('all')
  const [hotel, setHotel] = useState<string | 'all'>('all')
  const [tone, setTone] = useState<'neutral' | 'casual' | 'formal'>('neutral')
  const [propertyTab, setPropertyTab] = useState<'details'|'booking'|'promotions'>('details')
  const [mode, setMode] = useState<'manual'|'auto'>(() => {
    try { return (localStorage.getItem('inbox_mode') as any) || 'manual' } catch { return 'manual' }
  })
  const [autoRepliedTo, setAutoRepliedTo] = useState<Set<string>>(new Set())
  const [animateThreads, setAnimateThreads] = useState(false)
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false })

  function showToast(msg: string, ms = 3000) {
    setToast({ msg, visible: true })
    window.setTimeout(() => setToast({ msg: '', visible: false }), ms)
  }
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
      // Filter by view: inbox vs archive
      if (view === 'archive') {
        if (t.status !== 'resolved') return false
      } else {
        if (t.status === 'resolved') return false
      }
      if (sentiment !== 'all' && t.ai.sentiment !== sentiment) return false
      if (platform !== 'all' && t.platform !== platform) return false
      if (location !== 'all' && (t.guest?.location ?? '').toLowerCase() !== location.toLowerCase()) return false
      if (customerType !== 'all') {
        const ct = (t.guest?.customerType ?? 'regular') as CustomerType
        if (ct !== customerType) return false
      }
      if (hotel !== 'all' && t.property.name !== hotel) return false
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
  }, [threads, sentiment, platform, location, sla, customerType, hotel, query, view])

  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    for (const t of threads) {
      if (t.guest?.location) set.add(t.guest.location)
    }
    return Array.from(set).sort()
  }, [threads])
  function computeSuggestions(t?: Thread): string[] {
    if (!t) return []
    const base = t.ai.suggestedReplies || []
    const inbound = [...t.messages].reverse().find((m) => m.inbound)
    const promos = t.property?.promotions || []
    let dynamic: string[] = []
    if (inbound && promos.length) {
      const text = inbound.text || ''
      const match = promos.find((p) => new RegExp(`\\b${p.code}\\b`, 'i').test(text))
      if (match) {
        const now = Date.now()
        const start = new Date(match.start).getTime()
        const end = new Date(match.end).getTime()
        if (now >= start && now <= end) {
          dynamic = [
            `The code ${match.code} is valid for this period. I can apply the discount difference to your booking. May I confirm your booking ID?`,
            `I have verified ${match.code} is active. I’ll ensure your invoice reflects the ${match.title}.`,
          ]
        } else if (now > end) {
          dynamic = [
            `The code ${match.code} expired on ${new Date(match.end).toLocaleDateString()}. I can offer an alternative active promotion if eligible.`,
          ]
        } else {
          dynamic = [
            `The code ${match.code} starts on ${new Date(match.start).toLocaleDateString()}. I can suggest current active offers instead.`,
          ]
        }
      }
    }
    return dynamic.length ? [...dynamic, ...base] : base
  }

  const hotelOptions = useMemo(() => {
    const set = new Set<string>()
    for (const t of threads) {
      if (t.property?.name) set.add(t.property.name)
    }
    return Array.from(set).sort()
  }, [threads])

  useEffect(() => {
    if (mode !== 'auto') return
    const id = setInterval(async () => {
      let repliedCount = 0
      for (const t of threads) {
        if (t.status === 'resolved') continue
        const last = t.messages[t.messages.length - 1]
        if (!last || !last.inbound) continue
        if (autoRepliedTo.has(last.id)) continue
        const suggestions = computeSuggestions(t)
        const text = suggestions[0] || 'We are looking into this and will get back to you shortly.'
        const toned = await applyTone(text, tone, t.guest?.name)
        const translated = await translateText(toned, t.guest?.language)
        const updated = await addOutboundMessage(t.id, translated)
        setThreadsState(updated)
        setAutoRepliedTo((prev) => new Set(prev).add(last.id))
        repliedCount++

        // If promo code expired, automatically propose next available promotion
        try {
          const inboundText = (last.text || '').toString()
          const promos = t.property?.promotions || []
          const matched = promos.find((p) => new RegExp(`\\b${p.code}\\b`, 'i').test(inboundText))
          if (matched) {
            const now = Date.now()
            const end = new Date(matched.end).getTime()
            const isExpired = now > end
            if (isExpired) {
              const active = promos.find((p) => {
                const s = new Date(p.start).getTime(); const e = new Date(p.end).getTime()
                return now >= s && now <= e
              })
              let nextMsg: string | undefined
              if (active) {
                nextMsg = `We have an active offer: ${active.title} (code ${active.code}), valid ${new Date(active.start).toLocaleDateString()} – ${new Date(active.end).toLocaleDateString()}. Would you like me to apply it?`
              } else {
                const upcoming = promos
                  .map((p) => ({ p, s: new Date(p.start).getTime() }))
                  .filter((x) => x.s > now)
                  .sort((a, b) => a.s - b.s)[0]?.p
                if (upcoming) {
                  nextMsg = `The next upcoming offer is ${upcoming.title} (code ${upcoming.code}), starting ${new Date(upcoming.start).toLocaleDateString()}. I can share current alternatives too.`
                }
              }
              if (nextMsg) {
                const tonedFollow = await applyTone(nextMsg, tone, t.guest?.name)
                const translatedFollow = await translateText(tonedFollow, t.guest?.language)
                const updated2 = await addOutboundMessage(t.id, translatedFollow)
                setThreadsState(updated2)
                repliedCount++
              }
            }
          }
        } catch {}
      }
      if (repliedCount > 0) {
        showToast(`Auto-replied to ${repliedCount} thread${repliedCount>1?'s':''}.`)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [mode, threads, tone])

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
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Community AI Inbox</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden" title="Run mode">
              <button
                className={`px-2 py-1 text-xs ${mode==='manual'?'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100':'text-gray-600 dark:text-gray-300'}`}
                onClick={() => {
                  setMode('manual')
                  try { localStorage.setItem('inbox_mode','manual') } catch {}
                  showToast('Manual mode enabled')
                }}
              >Manual</button>
              <button
                className={`px-2 py-1 text-xs border-l border-gray-200 dark:border-gray-800 ${mode==='auto'?'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100':'text-gray-600 dark:text-gray-300'}`}
                onClick={() => {
                  setMode('auto')
                  try { localStorage.setItem('inbox_mode','auto') } catch {}
                  setAnimateThreads(true)
                  showToast('Auto mode enabled. AI will reply with context and guest language in mind.')
                  window.setTimeout(() => setAnimateThreads(false), 2500)
                }}
              >Auto</button>
            </div>
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
        <TagFilterBar
          sentiment={sentiment}
          platform={platform}
          location={location}
          locations={locationOptions}
          sla={sla}
          customerType={customerType}
          hotel={hotel}
          hotels={hotelOptions}
          onChange={(n) => {
            if (n.sentiment !== undefined) setSentiment(n.sentiment)
            if (n.platform !== undefined) setPlatform(n.platform)
            if (n.location !== undefined) setLocation(n.location)
            if (n.sla !== undefined) setSla(n.sla)
            if (n.customerType !== undefined) setCustomerType(n.customerType)
            if ((n as any).hotel !== undefined) setHotel((n as any).hotel)
          }}
        />

        <div className="flex-1 min-h-0">
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
            <div className="px-4 pt-2">
              <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button
                  className={`px-3 py-1 text-xs ${view === 'inbox' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setView('inbox')}
                  aria-pressed={view === 'inbox'}
                >Inbox</button>
                <button
                  className={`px-3 py-1 text-xs border-l border-gray-200 dark:border-gray-800 ${view === 'archive' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setView('archive')}
                  aria-pressed={view === 'archive'}
                >Archive</button>
              </div>
            </div>
                <div className={`flex-1 relative`}>
                  {animateThreads && (
                    <div className="absolute inset-0 z-10 bg-white/60 dark:bg-gray-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="animate-pulse">Auto-replying to threads…</span>
                      </div>
                    </div>
                  )}
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
                  onMarkComplete={async () => {
                    if (!selectedThread) return
                    const updated = await updateThread(selectedThread.id, (t) => ({ ...t, status: 'resolved' }))
                    setThreadsState(updated)
                    if (view === 'inbox') {
                      const next = updated.find((t) => t.status !== 'resolved')
                      setSelectedId(next?.id)
                    }
                  }}
                  onDeleteMessage={async (messageId) => {
                    if (!selectedThread) return
                    const updated = await deleteMessage(selectedThread.id, messageId)
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
                  suggestions={computeSuggestions(selectedThread)}
                  value={reply}
                  onChange={setReply}
                  placeholder={selectedThread?.guest?.language ? `Type a reply… (will send in ${selectedThread.guest.language})` : 'Type a reply...'}
                  tone={tone}
                  onToneChange={setTone}
                  disabled={mode==='auto'}
                  onSelectSuggestion={async (s) => {
                    const toned = await applyTone(s, tone, selectedThread?.guest?.name)
                    setReply(toned)
                  }}
                  onAttachImages={async (files) => {
                    if (!selectedThread) return
                    // Convert files to data URLs
                    const readAsDataURL = (file: File) => new Promise<string>((resolve, reject) => {
                      const reader = new FileReader()
                      reader.onload = () => resolve(reader.result as string)
                      reader.onerror = reject
                      reader.readAsDataURL(file)
                    })
                    const urls = await Promise.all(Array.from(files).map(readAsDataURL))
                    const attachments = urls.map((url) => ({ type: 'image' as const, url }))
                    const updated = await addOutboundAttachment(selectedThread.id, attachments)
                    setThreadsState(updated)
                  }}
                  showViewPromotions={(selectedThread?.property?.promotions?.length ?? 0) > 0}
                  onViewPromotions={() => {
                    setRightCollapsed(false)
                    setPropertyTab('promotions')
                  }}
                  onSend={async () => {
                    if (!selectedThread || !reply.trim()) return
                    const targetLang = selectedThread.guest?.language
                    const toned = await applyTone(reply.trim(), tone, selectedThread?.guest?.name)
                    const text = await translateText(toned, targetLang)
                    const updated = await addOutboundMessage(selectedThread.id, text)
                    setReply('')
                    setThreadsState(updated)
                  }}
                />
              </div>
            }
            right={<PropertyPanel
              property={selectedThread?.property}
              guestName={selectedThread?.guest?.name}
              customerType={selectedThread?.guest?.customerType}
              externalActiveTab={propertyTab}
              onSharePromotion={async (text, send) => {
                if (!selectedThread) return
                if (send) {
                  const targetLang = selectedThread.guest?.language
                  const toned = await applyTone(text, tone, selectedThread?.guest?.name)
                  const translated = await translateText(toned, targetLang)
                  const updated = await addOutboundMessage(selectedThread.id, translated)
                  setThreadsState(updated)
                } else {
                  setReply(text)
                }
              }}
              onCollapse={() => setRightCollapsed(true)}
            />}
            minLeftPx={320}
            minCenterPx={520}
            minRightPx={280}
            hideRight={rightCollapsed}
            onExpandRight={() => setRightCollapsed(false)}
          />
        </div>
        {toast.visible && (
          <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="rounded-md bg-gray-900 text-white text-xs px-3 py-2 shadow-lg">
              {toast.msg}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
