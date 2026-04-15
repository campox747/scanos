export function ControlPanel({ onStartRound, onReturnHome, onEmergencyStop, isActive }) {
  return (
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* START ROUND Button */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Automatic Inventory
          </label>
          <button
            onClick={onStartRound}
            disabled={isActive}
            className="w-full h-40 bg-[var(--accent-orange)] text-[var(--background)] rounded transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border-4 border-[var(--accent-orange)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">▶</div>
              <div className="text-xl font-bold uppercase tracking-wider">
                {isActive ? 'Running' : 'Start Round'}
              </div>
            </div>
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </button>
        </div>

        {/* RETURN HOME Button */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Navigation
          </label>
          <button
            onClick={onReturnHome}
            disabled={isActive}
            className="w-full h-40 bg-[var(--secondary)] text-[var(--foreground)] rounded transition-all duration-200 hover:bg-[var(--accent-yellow)] hover:text-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">⌂</div>
              <div className="text-xl font-bold uppercase tracking-wider">Return Home</div>
            </div>
          </button>
        </div>

        {/* EMERGENCY STOP Button */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Emergency
          </label>
          <button
            onClick={onEmergencyStop}
            className="w-full h-40 bg-[var(--red-alert)] text-white rounded transition-all duration-200 hover:brightness-110 border-4 border-[var(--red-alert)] shadow-lg"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">⬛</div>
              <div className="text-xl font-bold uppercase tracking-wider">Emergency Stop</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
