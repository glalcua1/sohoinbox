import type { Thread } from '../types/inbox'
import AssignDropdown from './AssignDropdown'
import Avatar from './Avatar'
import RatesCard from './RatesCard'

interface Props {
  thread?: Thread
  onAssign?: (assignment: { assignee: string; department?: string; priority: 'low'|'medium'|'high' } | undefined) => void
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
  onMarkComplete?: () => void
}

import { useEffect, useState } from 'react'

export default function ThreadView({ thread, onAssign, onAddTag, onRemoveTag, onMarkComplete }: Props) {
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (!thread) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 1500)
    return () => clearTimeout(t)
  }, [thread?.id])
  if (!thread) {
    return (
      <section className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Select a thread to view messages
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">{thread.threadTitle}</h3>
            <p className={`mt-1 text-xs ${flash ? 'bg-yellow-50 border-l-4 border-yellow-400 px-2 py-1 text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>AI: {thread.ai.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {thread.assignment && (
              <span className="text-xs text-gray-600">Assigned: {thread.assignment.assignee}{thread.assignment.department? ` (${thread.assignment.department})`: ''} • {thread.assignment.priority}</span>
            )}
          {thread.status === 'resolved' && (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
              Completed
            </span>
          )}
            <AssignDropdown
              assignees={[
                { name: 'Alex', department: 'Guest Relations' },
                { name: 'Sam', department: 'Support' },
                { name: 'Jordan', department: 'Operations' },
              ]}
              onAssign={onAssign || (()=>{})}
            />
          {thread.status !== 'resolved' && (
            <button
              className="ml-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onMarkComplete?.()}
              title="Mark this thread as complete"
            >Mark as complete</button>
          )}
          </div>
        </div>
        {thread.guest && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="relative group flex items-center gap-2">
              <Avatar name={thread.guest.name} src={thread.guest.avatarUrl} />
              <div className="min-w-0">
                <div className="truncate text-gray-900 dark:text-gray-100 font-medium">{thread.guest.name}</div>
                <div className="truncate">{thread.guest.username ? `@${thread.guest.username}` : ''}</div>
              </div>
              <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow group-hover:block dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Avatar name={thread.guest.name} src={thread.guest.avatarUrl} className="h-6 w-6" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900 dark:text-gray-100">{thread.guest.name}</div>
                    {thread.guest.username && <div className="truncate text-gray-500">@{thread.guest.username} • {thread.platform.toUpperCase()}</div>}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {thread.guest.location && <div>📍 {thread.guest.location}</div>}
                  {thread.guest.language && <div>🌐 {thread.guest.language}</div>}
                </div>
              </div>
            </div>
            {thread.guest.location && <span>📍 {thread.guest.location}</span>}
            {thread.guest.language && <span>🌐 {thread.guest.language}</span>}
            <span className="uppercase">{thread.platform}</span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {(thread.ai.tags || []).map((tag) => (
            <button key={tag} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300" onClick={() => onRemoveTag?.(tag)}>#{tag}</button>
          ))}
          <TagInput onAdd={(t) => onAddTag?.(t)} />
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {thread.messages.map((m) => (
          <div key={m.id} className={m.inbound ? 'text-left' : 'text-right'}>
            <div
              className={
                'inline-block max-w-[75%] rounded-lg px-4 py-2 text-sm ' +
                (m.inbound
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  : 'bg-indigo-600 text-white')
              }
            >
              <p className="text-[11px] opacity-70">{m.senderName}</p>
              <p>{m.text}</p>
              <p className="mt-1 text-[10px] opacity-60">{new Date(m.timestamp).toLocaleString()}</p>
            </div>
            {!m.inbound && /current rates and options/i.test(m.text) && (
              <div className="mt-2 text-left">
                <RatesCard property={thread.property} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value.trim()
    if (e.key === 'Enter' && value) {
      onAdd(value)
      ;(e.target as HTMLInputElement).value = ''
    }
  }
  return (
    <input
      placeholder="Add tag and press Enter"
      onKeyDown={onKeyDown}
      className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
    />
  )
}

