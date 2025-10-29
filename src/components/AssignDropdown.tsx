// src/components/AssignDropdown.tsx
import { useState } from 'react'

type Assignee = { name: string; department?: string }

interface Props {
  assignees: Assignee[]
  onAssign: (assignment: { assignee: string; department?: string; priority: 'low'|'medium'|'high' } | undefined) => void
  buttonClassName?: string
  label?: string
}

export default function AssignDropdown({ assignees, onAssign, buttonClassName, label = 'Assign' }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Assignee | undefined>(undefined)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={buttonClassName || 'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800'}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500">Assignee</div>
          <div className="max-h-56 overflow-auto">
            <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => { onAssign(undefined); setOpen(false) }}>Unassign</button>
            {assignees.map((a) => (
              <button
                key={a.name}
                className={
                  'block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ' +
                  (selected?.name === a.name ? 'bg-indigo-50' : '')
                }
                onClick={() => setSelected(a)}
                aria-pressed={selected?.name === a.name}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {selected?.name === a.name && <span className="text-indigo-600">✔</span>}
                    <span>{a.name}</span>
                  </span>
                  {a.department && <span className="text-[11px] text-gray-500">{a.department}</span>}
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Priority</div>
            <div className="flex gap-2">
              {(['low','medium','high'] as const).map((p) => (
                <button key={p} className={`rounded px-2 py-1 text-xs border ${priority===p? 'border-indigo-500 text-indigo-700 bg-indigo-50':'border-gray-300'}`} onClick={() => setPriority(p)}>{p}</button>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="text-sm px-2 py-1" onClick={() => setOpen(false)}>Cancel</button>
              <button
                className="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm hover:bg-indigo-700 disabled:opacity-50"
                disabled={!selected}
                onClick={() => { if (selected) onAssign({ assignee: selected.name, department: selected.department, priority }); setOpen(false); }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
