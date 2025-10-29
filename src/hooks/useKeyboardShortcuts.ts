import { useEffect } from 'react'

export interface KeyboardActions {
  focusSearch?: () => void
  startReply?: () => void
  assign?: () => void
}

export function useKeyboardShortcuts(actions: KeyboardActions) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && actions.focusSearch) {
        e.preventDefault()
        actions.focusSearch()
      }
      if ((e.key === 'r' || e.key === 'R') && actions.startReply) {
        e.preventDefault()
        actions.startReply()
      }
      if ((e.key === 'a' || e.key === 'A') && actions.assign) {
        e.preventDefault()
        actions.assign()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [actions])
}

