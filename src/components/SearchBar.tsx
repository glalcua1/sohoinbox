import { forwardRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

const SearchBar = forwardRef<HTMLInputElement, Props>(({ value, onChange }, ref) => {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search (/)"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔎</span>
      </div>
    </div>
  )
})

SearchBar.displayName = 'SearchBar'
export default SearchBar

