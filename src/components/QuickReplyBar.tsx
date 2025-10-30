interface Props {
  suggestions: string[]
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  tone: 'neutral' | 'casual' | 'formal'
  onToneChange: (tone: 'neutral' | 'casual' | 'formal') => void
  onAttachImages?: (files: FileList) => void
  onSelectSuggestion?: (s: string) => void
  showViewPromotions?: boolean
  onViewPromotions?: () => void
  disabled?: boolean
}

export default function QuickReplyBar({ suggestions, value, onChange, onSend, placeholder, tone, onToneChange, onAttachImages, onSelectSuggestion, showViewPromotions, onViewPromotions, disabled }: Props) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 sticky bottom-0 bg-white dark:bg-gray-950">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs px-3 py-1 text-gray-700 dark:text-gray-300"
            onClick={() => onSelectSuggestion ? onSelectSuggestion(s) : onChange(s)}
            type="button"
            disabled={disabled}
          >
            {s}
          </button>
        ))}
        {showViewPromotions && (
          <button
            type="button"
            className="ml-auto text-[11px] underline text-indigo-600 hover:text-indigo-700"
            onClick={onViewPromotions}
            title="View active promotions"
          >
            View promotions
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Tone</span>
          <select
            value={tone}
            onChange={(e) => onToneChange(e.target.value as any)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={disabled}
          >
            <option value="neutral">neutral</option>
            <option value="casual">casual</option>
            <option value="formal">formal</option>
          </select>
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Type a reply..."}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault()
              onSend()
            }
          }}
          disabled={disabled}
        />
        <label className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" title="Attach image">
          📎
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (disabled) return; if (e.target.files && onAttachImages) onAttachImages(e.target.files); e.currentTarget.value=''; }} />
        </label>
        <button
          className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  )
}

