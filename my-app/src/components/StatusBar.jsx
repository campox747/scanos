import { useState, useEffect } from 'react'

export function StatusBar({ status }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'idle':      return 'var(--accent-yellow)'
      case 'running':   return 'var(--yellow-caution)'
      case 'searching': return 'var(--accent-orange)'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'idle':      return 'STANDBY'
      case 'running':   return 'INVENTORY ROUND IN PROGRESS'
      case 'searching': return 'SEARCHING FOR ITEM'
    }
  }

  const isActive = status !== 'idle'

  return (
    <div className="bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center px-6 h-16 shadow-sm transition-all relative">
      
      {/* Left Side: Clock + Status */}
      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="opacity-60 text-sm tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {time.toLocaleTimeString()}
        </div>

        {/* Status */}
        <div
          className={`px-4 py-2 rounded flex items-center gap-3 transition-all ${isActive ? 'animate-pulse shadow-lg' : ''}`}
          style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: `${getStatusColor()}20`,
            border: `2px solid ${getStatusColor()}`,
            color: getStatusColor(),
          }}
        >
          <div
            className={`w-3 h-3 rounded-full ${isActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="uppercase tracking-wider font-bold text-sm">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Center: Title */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="!text-2xl tracking-wide uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
          Scanos Control Panel
        </h1>
      </div>

    </div>
  )
}
