// ControlPanel.jsx
// Pure presentational + interaction layer.
// App.jsx owns the Firestore listener and passes status + handlers as props.

export function ControlPanel({ onStartRound, onEmergencyStop, robotStatus, searchTarget }) {

  const isLoading   = robotStatus === null       // null = still connecting
  const isIdle      = robotStatus === 'idle'
  const isRunning   = robotStatus === 'running'
  const isSearching = robotStatus === 'searching'

  const canStart  = isIdle
  const canStop   = isRunning || isSearching

  const statusLabel = isLoading
    ? 'Connecting…'
    : {
        idle:      'Idle',
        running:   'Running Round',
        searching: `Searching${searchTarget ? `: ${searchTarget}` : ''}`,
      }[robotStatus] ?? robotStatus

  const statusColor = {
    idle:      'var(--accent-yellow)',
    running:   'var(--yellow-caution)',
    searching: 'var(--accent-orange)',
  }[robotStatus] ?? 'var(--border)'

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded p-6 space-y-4">

      {/* Status bar */}
      <div className="flex items-center gap-3 px-1">
        <span
          className="h-2.5 w-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: statusColor }}
        />
        <span
          className="text-xs uppercase tracking-widest opacity-70"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Status: <span style={{ color: statusColor }}>{statusLabel}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* START ROUND */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Automatic Inventory Scan
          </label>
          <button
            onClick={onStartRound}
            disabled={!canStart || isLoading}
            className="w-full h-40 bg-[var(--accent-orange)] text-[var(--background)] rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden border-4 border-[var(--accent-orange)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">▶</div>
              <div className="text-xl font-bold uppercase tracking-wider">
                {isRunning ? 'Running…' : isSearching ? 'Searching…' : 'Start Round'}
              </div>
            </div>
            {(isRunning || isSearching) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </button>
        </div>

        {/* EMERGENCY STOP */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Emergency Stop
          </label>
          <button
            onClick={onEmergencyStop}
            disabled={!canStop || isLoading}
            className="w-full h-40 bg-[var(--red-alert)] text-white rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-[var(--red-alert)] shadow-lg"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">■</div>
              <div className="text-xl font-bold uppercase tracking-wider">Stop</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
