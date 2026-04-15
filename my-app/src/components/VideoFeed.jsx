import { useState, useEffect } from 'react'

export function VideoFeed({ status }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-[#1f2229] to-[#2a2e35] rounded border-2 border-[var(--border)] overflow-hidden aspect-video flex-1 shadow-lg">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Crosshair overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 border border-[var(--accent-orange)]/30 rounded-full" />
        <div className="absolute w-1 h-16 bg-[var(--accent-orange)]/30" />
        <div className="absolute h-1 w-16 bg-[var(--accent-orange)]/30" />
      </div>

      {/* Camera feed placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl opacity-20" style={{ fontFamily: 'var(--font-sans)' }}>📹</div>
          <div className="text-lg opacity-40 uppercase tracking-wider" style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-orange)' }}>
            Robot Camera Feed
          </div>
          <div className="text-sm opacity-30 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            Waiting for stream...
          </div>
        </div>
      </div>

      {/* Top left: REC + timestamp */}
      <div className="absolute top-4 left-4 space-y-2">
        <div
          className="px-4 py-2 bg-[var(--card)]/95 border-2 border-[var(--red-alert)] backdrop-blur-sm rounded flex items-center gap-2 shadow-lg"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span className="opacity-80 text-xs uppercase tracking-wider">REC</span>{' '}
          <span className="text-[var(--red-alert)] animate-pulse">●</span>
        </div>
        <div
          className="px-4 py-2 bg-[var(--card)]/95 border border-[var(--border)] backdrop-blur-sm text-xs opacity-80 rounded tabular-nums shadow-lg"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {time.toLocaleString()}
        </div>
      </div>

      {/* Top right: Camera info */}
      <div className="absolute top-4 right-4">
        <div
          className="px-4 py-2 bg-[var(--card)]/95 border border-[var(--border)] backdrop-blur-sm text-xs uppercase tracking-wider shadow-lg rounded"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          CAM-01 | 1920x1080
        </div>
      </div>

      {/* Bottom info bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[var(--card)]/95 backdrop-blur-sm border-t-2 border-[var(--border)] px-5 py-3 flex items-center justify-between shadow-lg"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <div className="flex gap-6 text-xs uppercase tracking-wider">
          <div>
            <span className="opacity-60">Battery:</span>{' '}
            <span className="text-[var(--green-status)] font-bold">87%</span>
          </div>
          <div>
            <span className="opacity-60">Location:</span>{' '}
            <span className="text-[var(--accent-orange)] font-bold">Sector A-12</span>
          </div>
          <div>
            <span className="opacity-60">Signal:</span>{' '}
            <span className="text-[var(--green-status)] font-bold">Strong</span>
          </div>
        </div>
        {status === 'running' && (
          <div className="text-[var(--yellow-caution)] animate-pulse text-xs uppercase tracking-wider font-bold">
            ⚠ Scanning...
          </div>
        )}
        {status === 'searching' && (
          <div className="text-[var(--accent-orange)] animate-pulse text-xs uppercase tracking-wider font-bold">
            🔍 Searching...
          </div>
        )}
      </div>
    </div>
  )
}
