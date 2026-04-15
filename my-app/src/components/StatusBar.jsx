import { useState, useEffect } from 'react'

export function StatusBar({ status }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'idle':      return 'var(--green-status)'
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
    <div className={`bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center justify-between px-6 transition-all ${
      isActive ? 'h-24 shadow-lg' : 'h-16 shadow-sm'
    }`}>
      {/* Logo/Title */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="tracking-wide uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
            Warehouse Robot Control
          </h1>
          <div className="text-xs opacity-60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            System v2.4.1
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <div
          className={`px-6 py-3 rounded flex items-center gap-3 transition-all ${isActive ? 'animate-pulse shadow-lg' : ''}`}
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
        <div className="opacity-60 text-sm tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
