import type { Platform, Sentiment } from '../types/inbox'

interface Props {
  sentiment: Sentiment | 'all'
  platform: Platform | 'all'
  location: string | 'all'
  locations: string[]
  sla: 'all' | 'delayed' | 'on_time'
  onChange: (next: { sentiment?: Sentiment | 'all'; platform?: Platform | 'all'; location?: string | 'all'; sla?: 'all' | 'delayed' | 'on_time' }) => void
}

export default function TagFilterBar({ sentiment, platform, location, locations, sla, onChange }: Props) {
  const sOptions: Array<Sentiment | 'all'> = ['all', 'positive', 'neutral', 'negative']
  const pOptions: Array<Platform | 'all'> = ['all', 'facebook', 'instagram', 'x', 'google', 'tripadvisor']
  const slaOptions: Array<'all' | 'delayed' | 'on_time'> = ['all', 'delayed', 'on_time']
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">Sentiment:</span>
        <select
          value={sentiment}
          onChange={(e) => onChange({ sentiment: e.target.value as any })}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">SLA:</span>
        <select
          value={sla}
          onChange={(e) => onChange({ sla: e.target.value as any })}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {slaOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'on_time' ? 'on-time' : opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">Platform:</span>
        <select
          value={platform}
          onChange={(e) => onChange({ platform: e.target.value as any })}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {pOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">Location:</span>
        <select
          value={location}
          onChange={(e) => onChange({ location: e.target.value as any })}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="ml-auto">
        <button
          className="rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => onChange({ sentiment: 'all', platform: 'all', location: 'all', sla: 'all' })}
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}

