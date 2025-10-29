import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('UI ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-700 bg-red-50">
          <p className="font-semibold">Something went wrong.</p>
          <pre className="mt-2 whitespace-pre-wrap">{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}


