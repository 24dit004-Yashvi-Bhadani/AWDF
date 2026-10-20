import { useEffect, useState } from 'react'

function LoadingFallback({ label = 'Loading page...' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 300)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div className="loading-fallback" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingFallback
