// src/components/BulkActionBar.tsx
import AssignDropdown from './AssignDropdown'

interface Props {
  count: number
  onAssign: (assignment: { assignee: string; department?: string; priority: 'low'|'medium'|'high' } | undefined) => void
  onClear: () => void
}

export default function BulkActionBar({ count, onAssign, onClear }: Props) {
  if (count === 0) return null
  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-amber-50/80 dark:bg-amber-900/10 backdrop-blur px-4 py-2 flex items-center justify-between">
      <div className="text-xs text-amber-800 dark:text-amber-200">{count} selected</div>
      <div className="flex items-center gap-2">
        <AssignDropdown
          assignees={[
            { name: 'Alex', department: 'Guest Relations' },
            { name: 'Sam', department: 'Support' },
            { name: 'Jordan', department: 'Operations' },
          ]}
          onAssign={onAssign}
          buttonClassName="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm hover:bg-indigo-700"
          label="Assign"
        />
        <button className="rounded-md border border-amber-300 dark:border-amber-700 px-3 py-1.5 text-xs" onClick={onClear}>Clear</button>
      </div>
    </div>
  )
}
