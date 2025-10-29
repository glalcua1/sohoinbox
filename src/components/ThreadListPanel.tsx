import type { Thread } from '../types/inbox'
import { formatRelativeTime, lastInboundTimestampISO } from '../utils/datetime'
import Avatar from './Avatar'

interface Props {
  threads: Thread[]
  selectedId?: string
  onSelect: (threadId: string) => void
  selectedIds?: Set<string>
  onToggleSelect?: (threadId: string) => void
  onToggleSelectAll?: (checked: boolean) => void
}

function sentimentBadgeClass(sentiment: Thread['ai']['sentiment']): string {
  if (sentiment === 'positive') return 'bg-green-100 text-green-700'
  if (sentiment === 'negative') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function isOverSla(thread: Thread): boolean {
  // Simple SLA: respond within 15 minutes for negative, 30 minutes otherwise
  const lastInbound = [...thread.messages].reverse().find((m) => m.inbound)
  if (!lastInbound) return false
  const minutes = (Date.now() - new Date(lastInbound.timestamp).getTime()) / 60000
  const target = thread.ai.sentiment === 'negative' ? 15 : 30
  return minutes > target && thread.status !== 'resolved'
}

function priorityBadgeClass(p?: 'low'|'medium'|'high'): string {
  if (p === 'high') return 'bg-red-100 text-red-700'
  if (p === 'medium') return 'bg-amber-100 text-amber-800'
  if (p === 'low') return 'bg-emerald-100 text-emerald-700'
  return 'bg-gray-100 text-gray-700'
}

export default function ThreadListPanel({ threads, selectedId, onSelect, selectedIds, onToggleSelect, onToggleSelectAll }: Props) {
  const allSelected = threads.length > 0 && selectedIds && threads.every((t) => selectedIds.has(t.id))
  return (
    <aside className="h-full w-full overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <input
          type="checkbox"
          aria-label="Select all"
          checked={allSelected}
          onChange={(e) => onToggleSelectAll?.(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
        />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Threads</h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {threads.map((t) => {
          const isActive = t.id === selectedId
          const overSla = isOverSla(t)
          const lastInboundISO = lastInboundTimestampISO(t.messages)
          const relative = lastInboundISO ? formatRelativeTime(lastInboundISO) : formatRelativeTime(t.lastUpdated)
          return (
            <li
              key={t.id}
              className={
                'cursor-pointer px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 ' +
                (isActive ? 'bg-gray-50 dark:bg-gray-900' : '')
              }
            >
              <div className="flex items-start gap-3" onClick={() => onSelect(t.id)}>
                <input
                  type="checkbox"
                  aria-label="Select thread"
                  checked={selectedIds?.has(t.id) ?? false}
                  onChange={(e) => {
                    e.stopPropagation()
                    onToggleSelect?.(t.id)
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{t.threadTitle}</p>
                  {t.guest && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <Avatar name={t.guest.name} src={t.guest.avatarUrl} className="h-4 w-4" />
                      <span className="truncate">{t.guest.name}{t.guest.username ? ` • @${t.guest.username}` : ''}{t.guest.location ? ` • ${t.guest.location}` : ''}</span>
                    </span>
                  )}
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] ${sentimentBadgeClass(t.ai.sentiment)}`}>
                      {t.ai.sentiment}
                    </span>
                    {overSla && <span className="inline-flex h-2 w-2 rounded-full bg-red-500" aria-label="Over SLA"></span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{t.ai.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="uppercase">{t.platform}</span>
                    <span>•</span>
                    <span>{relative}</span>
                    {t.assignment && (
                      <>
                        <span>•</span>
                        <span>Assigned: {t.assignment.assignee}{t.assignment.department? ` (${t.assignment.department})`: ''}</span>
                        <span className={`ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] ${priorityBadgeClass(t.assignment.priority)}`}>{t.assignment.priority}</span>
                      </>
                    )}
                    {t.ai.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="ml-1 rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px]">#{tag}</span>
                    ))}
                    <span title="Over SLA" className="sr-only" />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

