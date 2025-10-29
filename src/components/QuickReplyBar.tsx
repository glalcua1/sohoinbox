interface Props {
  suggestions: string[]
  value: string
  onChange: (value: string) => void
  onSend: () => void
}

export default function QuickReplyBar({ suggestions, value, onChange, onSend }: Props) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="mb-2 flex flex-wrap gap-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs px-3 py-1 text-gray-700 dark:text-gray-300"
            onClick={() => onChange(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a reply..."
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault()
              onSend()
            }
          }}
        />
        <button
          className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2"
          onClick={onSend}
          disabled={!value.trim()}
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  )
}

