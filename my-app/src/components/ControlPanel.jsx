  export function ControlPanel({ onStartRound, onEmergencyStop, onReturnHome, robotStatus, searchTarget }) {

    const isLoading   = robotStatus === null
    const isIdle      = robotStatus === 'idle'
    const isRunning   = robotStatus === 'running'
    const isSearching = robotStatus === 'searching'
    const isReturning = robotStatus === 'returning'

    const canStart  = isIdle
    const canStop   = isRunning || isSearching || isReturning // Stop works while returning
    const canReturnHome = isRunning || isSearching || isIdle // Don't return home if already returning

    const statusLabel = isLoading
      ? 'Connecting…'
      : {
          idle:      'Idle',
          running:   'Running Round',
          searching: `Searching${searchTarget ? `: ${searchTarget}` : ''}`,
          returning: 'Returning Home',
        }[robotStatus] ?? robotStatus

    const statusColor = {
      idle:      'var(--accent-yellow)',
      running:   'var(--green-status)',
      searching: 'var(--accent-orange)',
      returning: 'var(--accent-yellow)'
    }[robotStatus] ?? 'var(--border)'

    return (
      // Added flex col and h-full to take up the entire left side
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded p-6 flex flex-col h-full gap-4">

        <div className="flex items-center gap-3 px-1 shrink-0">
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

        {/* Changed to flex col to stack buttons, each taking 50% available height */}
        <div className="flex flex-col flex-1 gap-6">

          {/* START ROUND */}
          <div className="flex flex-col flex-1 space-y-2">
            <label
              className="block opacity-70 text-xs uppercase tracking-wider shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Automatic Inventory Scan
            </label>
            <button
              onClick={onStartRound}
              disabled={!canStart || isLoading}
              className="w-full h-full flex-1 flex flex-col items-center justify-center bg-[var(--accent-orange)] text-[var(--background)] rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden border-4 border-[var(--accent-orange)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <div className="relative z-10 flex flex-col items-center">
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


          {/* RETURN HOME */}
          <div className="flex flex-col flex-1 space-y-2">
            <label
              className="block opacity-70 text-xs uppercase tracking-wider shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Navigation
            </label>
                    
            <button
              onClick={onReturnHome}
              disabled={!canReturnHome || isLoading}
              className="w-full h-full flex-1 flex flex-col items-center justify-center bg-[var(--accent-yellow)] text-[var(--background)] rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-[var(--accent-yellow)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-5xl mb-2">⌂</div>
                <div className="text-xl font-bold uppercase tracking-wider">
                  Return Home
                </div>
              </div>
            </button>
          </div>

          {/* EMERGENCY STOP */}
          <div className="flex flex-col flex-1 space-y-2">
            <label
              className="block opacity-70 text-xs uppercase tracking-wider shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Emergency Stop
            </label>
            <button
              onClick={onEmergencyStop}
              disabled={!canStop || isLoading}
              className="w-full h-full flex-1 flex flex-col items-center justify-center bg-[var(--red-alert)] text-white rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-[var(--red-alert)] shadow-lg"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-5xl mb-2">■</div>
                <div className="text-xl font-bold uppercase tracking-wider">Stop</div>
              </div>
            </button>
          </div>

        </div>
      </div>
    )
  }
