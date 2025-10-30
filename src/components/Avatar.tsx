import { useEffect, useState } from 'react'

interface Props {
  name: string
  src?: string
  className?: string
}

export default function Avatar({ name, src, className }: Props) {
  const [errored, setErrored] = useState(false)
  const resolveSrc = (input?: string): string | undefined => {
    if (!input) return undefined
    // If absolute http(s) URL, leave as-is
    if (/^https?:\/\//i.test(input)) return input
    const base = (import.meta as any).env?.BASE_URL || '/'
    if (input.startsWith('/')) {
      // Convert absolute-from-root to respect Vite base path
      return base.replace(/\/$/, '') + input
    }
    // For relative paths like "avatars/x.svg", ensure base prefix
    return base + input
  }
  const [currentSrc, setCurrentSrc] = useState(resolveSrc(src))
  // keep currentSrc in sync if src prop changes
  // and reset error state so we retry with the new src
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCurrentSrc(resolveSrc(src))
    setErrored(false)
  }, [src])
  const initial = name?.slice(0, 1).toUpperCase() || '?'
  if (!currentSrc || errored) {
    return (
      <div
        className={
          'rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-[11px] text-indigo-900 dark:text-indigo-100 ' +
          (className || 'h-7 w-7')
        }
        aria-label={name}
        title={name}
      >
        {initial}
      </div>
    )
  }
  return (
    <img
      src={currentSrc}
      alt={name}
      onError={() => {
        // Try fallbacks: .svg -> .jpg -> .png, then give up
        if (currentSrc.endsWith('.svg')) setCurrentSrc(currentSrc.replace(/\.svg$/i, '.jpg'))
        else if (currentSrc.endsWith('.jpg')) setCurrentSrc(currentSrc.replace(/\.jpg$/i, '.png'))
        else setErrored(true)
      }}
      className={'rounded-full object-cover ' + (className || 'h-7 w-7')}
    />
  )
}


